import { useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const navigate = useNavigate();

    const registrar = async (e) => {
        e.preventDefault();
        if (contraseña !== confirmar) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, contraseña);
            navigate('/');
        } catch (error) {
            alert('Error al registrar: ' + error.message);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={registrar} style={styles.form}>
                <h2 style={styles.title}>Crear cuenta</h2>

                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    required
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    required
                    style={styles.input}
                />

                <button type="submit" style={styles.button}>Registrarse</button>

                <p style={styles.text}>
                    ¿Ya tienes cuenta?{' '}
                    <span style={styles.link} onClick={() => navigate('/login')}>Inicia sesión</span>
                </p>
            </form>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    form: {
        backgroundColor: '#fff',
        padding: 40,
        borderRadius: 10,
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        width: 320,
        display: 'flex',
        flexDirection: 'column',
        gap: 15
    },
    title: {
        textAlign: 'center',
        marginBottom: 10
    },
    input: {
        padding: 12,
        border: '1px solid #ccc',
        borderRadius: 6,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
        outline: 'none',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
    },
    button: {
        padding: 12,
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    text: {
        textAlign: 'center'
    },
    link: {
        color: '#007bff',
        cursor: 'pointer',
        textDecoration: 'underline'
    }
};
