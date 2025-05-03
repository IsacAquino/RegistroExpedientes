import { useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');
    const navigate = useNavigate();

    const iniciarSesion = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, contraseña);
            navigate('/');
        } catch (error) {
            alert('Error al iniciar sesión: ' + error.message);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={iniciarSesion} style={styles.form}>
                <h2 style={styles.title}>Iniciar Sesión</h2>

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

                <button type="submit" style={styles.button}>Entrar</button>

                <p style={styles.text}>
                    ¿No tienes cuenta?{' '}
                    <span style={styles.link} onClick={() => navigate('/register')}>Regístrate</span>
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
        transition: 'border 0.3s',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
    },
    inputFocus: {
        border: '1px solid #007bff',
    },


    button: {
        padding: 12,
        backgroundColor: '#007bff',
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
