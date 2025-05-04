import { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { CSSProperties } from 'react';


type Expediente = {
    id: string;
    uid?: string;
    codigo?: string;
    descripcion?: string;
    estado?: string;
    creado?: string;
    vencimiento?: string;
};

const estados = ['Pendiente', 'En Proceso', 'En Pausa', 'Completada'];
const colores: Record<string, string> = {
    'Pendiente': '#d3d3d3',
    'En Proceso': '#212529',
    'En Pausa': '#f0ad4e',
    'Completada': '#28a745'
};

const iconos: Record<string, string> = {
    'Pendiente': '⏰',
    'En Proceso': '▶️',
    'En Pausa': '⏸️',
    'Completada': '✅'
};

export default function Home() {
    const [expedientes, setExpedientes] = useState<Expediente[]>([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [expedienteEditar, setExpedienteEditar] = useState<Expediente | null>(null);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [estado, setEstado] = useState('Pendiente');
    const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
    const [vencimiento, setVencimiento] = useState(() => {
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 7);
        return hoy.toISOString().split('T')[0];
    });
    const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null);
    const navigate = useNavigate();

    const fechaInputRef = useRef<HTMLInputElement>(null);
    const vencimientoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            navigate('/login');
            return;
        }

        const unsubscribe = onSnapshot(collection(db, 'antecedentes'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Expediente[];
            const soloMios = data.filter(d => d.uid === user.uid);

            const normalizados = soloMios.map(e => ({
                ...e,
                creado: normalizarFechaISO(e.creado || ''),
                vencimiento: normalizarFechaISO(e.vencimiento || '')
            }));

            setExpedientes(normalizados);
        });

        return () => unsubscribe();
    }, [navigate]);

    const cerrarSesion = async () => {
        await auth.signOut();
        navigate('/login');
    };

    const normalizarFechaISO = (fechaStr: string | undefined): string => {
        if (!fechaStr) return '';
        if (fechaStr.includes('/')) {
            const [dia, mes, año] = fechaStr.split('/');
            return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
        return fechaStr;
    };

    const convertirADateInput = (fechaStr?: string): string => {
        if (!fechaStr) return '';
        if (fechaStr.includes('/')) {
            const [dia, mes, año] = fechaStr.split('/');
            return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
        return fechaStr;
    };



    const formatearFechaVisual = (fechaStr: string | undefined): string => {
        if (!fechaStr) return '';
        if (fechaStr.includes('/')) return fechaStr;
        const [año, mes, dia] = fechaStr.split('-');
        return `${dia}/${mes}/${año}`;
    };


    const guardarExpediente = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        const nuevoExpediente: Omit<Expediente, 'id'> = {
            codigo: titulo,
            descripcion,
            estado,
            uid: user.uid,
            creado: formatearFechaVisual(fecha),
            vencimiento: formatearFechaVisual(vencimiento)
        };

        if (modoEdicion && expedienteEditar) {
            await updateDoc(doc(db, 'antecedentes', expedienteEditar.id), nuevoExpediente);
        } else {
            await addDoc(collection(db, 'antecedentes'), nuevoExpediente);
        }

        limpiarFormulario();
    };

    const limpiarFormulario = () => {
        setTitulo('');
        setDescripcion('');
        setEstado('Pendiente');
        setFecha(new Date().toISOString().split('T')[0]);
        const hoyMas7 = new Date();
        hoyMas7.setDate(hoyMas7.getDate() + 7);
        setVencimiento(hoyMas7.toISOString().split('T')[0]);
        setMostrarFormulario(false);
        setModoEdicion(false);
        setExpedienteEditar(null);
    };

    const editarExpediente = (expediente: Expediente) => {
        setTitulo(expediente.codigo ?? '');
        setDescripcion(expediente.descripcion ?? '');
        setFecha(convertirADateInput(expediente.creado || ''));
        setVencimiento(convertirADateInput(expediente.vencimiento || ''));
        setEstado(expediente.estado ?? 'Pendiente');
        setExpedienteEditar(expediente);
        setModoEdicion(true);
        setMostrarFormulario(true);
        setMenuAbiertoId(null);
    };


    const cambiarEstado = async (id: string, nuevoEstado: string) => {
        await updateDoc(doc(db, 'antecedentes', id), { estado: nuevoEstado });
        setMenuAbiertoId(null);
    };

    const eliminarExpediente = async (id: string) => {
        await deleteDoc(doc(db, 'antecedentes', id));
    };

    const estaVencido = (fechaStr: string): boolean => {
        if (!fechaStr) return false;
        const hoy = new Date().toISOString().split('T')[0];
        return fechaStr < hoy;
    };

    const esHoy = (fechaStr: string): boolean => {
        if (!fechaStr) return false;
        const hoy = new Date().toISOString().split('T')[0];
        return fechaStr === hoy;
    };


    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ margin: 0 }}>Sistema de Gestión de Antecedentes</h2>
                <div>
                    <button onClick={() => setMostrarFormulario(true)} style={styles.nuevoBtn}>+ Nuevo Expediente</button>
                    <button onClick={cerrarSesion} style={styles.logoutBtn}>Cerrar sesión</button>
                </div>
            </div>

            {mostrarFormulario && (
                <form onSubmit={guardarExpediente} style={styles.formulario}>
                    <h3 style={{ marginBottom: 20 }}>{modoEdicion ? 'Editar Expediente' : 'Nuevo Expediente'}</h3>
                    <input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={styles.whiteInput} />
                    <textarea placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required style={{ ...styles.whiteInput, height: 100 }} />
                    <div style={styles.row}>
                        <div style={styles.col}>
                            <label style={styles.label}>Fecha</label>
                            <div style={{ position: 'relative' }}>
                                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required ref={fechaInputRef} style={{ ...styles.whiteInput, paddingRight: 20 }} />
                                <button type="button" onClick={() => fechaInputRef.current?.showPicker?.()} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>🗓️</button>
                            </div>
                        </div>
                        <div style={styles.col}>
                            <label style={styles.label}>Fecha de vencimiento</label>
                            <div style={{ position: 'relative' }}>
                                <input type="date" value={vencimiento} onChange={(e) => setVencimiento(e.target.value)} required ref={vencimientoInputRef} style={{ ...styles.whiteInput, paddingRight: 20 }} />
                                <button type="button" onClick={() => vencimientoInputRef.current?.showPicker?.()} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>🗓️</button>
                            </div>
                        </div>
                    </div>
                    <label style={styles.label}>Estado</label>
                    <select value={estado} onChange={(e) => setEstado(e.target.value)} style={styles.whiteInput}>
                        {estados.map(e => <option key={e}>{e}</option>)}
                    </select>
                    <div style={styles.row}>
                        <button type="submit" style={{ ...styles.nuevoBtn, flex: 1 }}>Guardar</button>
                        <button type="button" onClick={limpiarFormulario} style={{ ...styles.cancelBtn, flex: 1 }}>Cancelar</button>
                    </div>
                </form>
            )}

            <div style={styles.kanban}>
                {estados.map(estado => (
                    <div key={estado} style={{ ...styles.column, borderTop: `6px solid ${colores[estado]}` }}>
                        <div style={styles.columnHeader}>
                            <h3 style={{ color: colores[estado], margin: 0 }}>{iconos[estado]} {estado}</h3>
                            <span style={{ fontSize: 12, color: '#666' }}>{expedientes.filter(e => e.estado === estado).length} casos</span>
                        </div>
                        <div style={styles.scrollColumn}>
                            {expedientes.filter(e => e.estado === estado).map(e => {
                                const vencido = estaVencido(e.vencimiento);
                                const hoy = esHoy(e.vencimiento);
                                return (
                                    <div key={e.id} style={styles.card}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <strong style={{ fontSize: 16 }}>{e.codigo}</strong>
                                                <p style={{ margin: '4px 0', fontSize: 14 }}>{e.descripcion}</p>
                                                <p style={{ margin: '4px 0', fontSize: 12 }}>Creado: {formatearFechaVisual((e.creado ?? '') as string)}</p>
                                                <p style={{
                                                    margin: '4px 0',
                                                    fontSize: 12,
                                                    color: vencido ? 'red' : hoy ? '#d38b00' : '#333',
                                                    fontWeight: vencido || hoy ? 'bold' : 'normal'
                                                }}>
                                                    <span>{vencido ? '🔴' : hoy ? '🟡' : '🗓️'} Vence: {formatearFechaVisual((e.vencimiento ?? '') as string)}</span>

                                                    {vencido && <span style={{
                                                        marginLeft: 6,
                                                        background: 'red',
                                                        color: 'white',
                                                        padding: '2px 6px',
                                                        borderRadius: 4,
                                                        fontSize: 10
                                                    }}>Vencido</span>}
                                                    {hoy && !vencido && <span style={{
                                                        marginLeft: 6,
                                                        background: '#d38b00',
                                                        color: 'white',
                                                        padding: '2px 6px',
                                                        borderRadius: 4,
                                                        fontSize: 10
                                                    }}>Hoy</span>}
                                                </p>
                                            </div>
                                            <div style={{position: 'relative'}}>
                                                <button
                                                    onClick={() => setMenuAbiertoId(menuAbiertoId === e.id ? null : e.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        fontSize: 20,
                                                        cursor: 'pointer',
                                                        color: 'black' }}>⋮</button>
                                                {menuAbiertoId === e.id && (
                                                    <div style={styles.menuDesplegable}>
                                                        <button style={styles.menuItem} onClick={() => editarExpediente(e)}>✏️ Editar</button>
                                                        {estados.map(est => (
                                                            <button
                                                                key={est}
                                                                disabled={est === e.estado}
                                                                onClick={() => cambiarEstado(e.id, est)}
                                                                style={{
                                                                    ...styles.menuItem,
                                                                    opacity: est === e.estado ? 0.5 : 1,
                                                                    cursor: est === e.estado ? 'default' : 'pointer'
                                                                }}>
                                                                Cambiar a {est}
                                                            </button>
                                                        ))}
                                                        <button onClick={() => eliminarExpediente(e.id)} style={{ ...styles.menuItem, color: 'red' }}>🗑️ Eliminar</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles: { [key: string]: CSSProperties } = {
    container: { backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    logoutBtn: { backgroundColor: '#6c757d', color: '#fff', padding: '10px 16px', border: 'none', borderRadius: 6, marginLeft: 10, cursor: 'pointer' },
    nuevoBtn: { backgroundColor: '#007bff', color: '#fff', padding: '10px 16px', border: 'none', borderRadius: 6, cursor: 'pointer' },
    cancelBtn: { backgroundColor: '#dc3545', color: '#fff', padding: '10px 16px', border: 'none', borderRadius: 6, cursor: 'pointer' },
    kanban: { display: 'flex', gap: 10, flexWrap: 'nowrap', overflowX: 'auto' },
    column: { backgroundColor: '#fff', borderRadius: 10, padding: 10, minWidth: 270, maxHeight: '75vh', display: 'flex', flexDirection: 'column', boxShadow: '0 0 10px rgba(0,0,0,0.1)' },
    scrollColumn: { overflowY: 'auto', paddingRight: 5 },
    columnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10 },
    card: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
    formulario: { backgroundColor: '#fff', padding: 20, marginBottom: 20, borderRadius: 10, boxShadow: '0 0 10px rgba(0,0,0,0.1)', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' },
    input: { width: '100%', padding: '10px 12px', marginBottom: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 },
    whiteInput: {
        width: '100%',
        padding: '10px 12px',
        marginBottom: 12,
        borderRadius: 6,
        border: '1px solid #ccc',
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#000'
    },
    label: { display: 'block', marginBottom: 6, fontWeight: 'bold' },
    row: { display: 'flex', gap: 10, marginBottom: 12 },
    col: { flex: 1 },
    menuDesplegable: { position: 'absolute', top: 30, right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10, minWidth: 180 },
    menuItem: { display: 'block', width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: 14, color: '#333', cursor: 'pointer', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' },
    hoyLabel: {
        marginLeft: 6,
        background: '#d38b00',
        color: 'white',
        padding: '2px 6px',
        borderRadius: 4,
        fontSize: 10
    }
};
