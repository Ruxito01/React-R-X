// src/pages/GoogleCallback.jsx
// Página que maneja el redirect de Google OAuth
// Solución para compatibilidad con Microsoft Edge

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const GoogleCallback = () => {
    const [status, setStatus] = useState('Procesando autenticación...');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Extraer el token del hash de la URL (después del #)
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const access_token = params.get('access_token');
                const authError = params.get('error');

                if (authError) {
                    setError('Error al autenticar con Google. Intenta de nuevo.');
                    setTimeout(() => navigate('/'), 3000);
                    return;
                }

                if (!access_token) {
                    setError('No se recibió token de Google.');
                    setTimeout(() => navigate('/'), 3000);
                    return;
                }

                setStatus('Obteniendo información del usuario...');
                console.log('🔵 Token de Google recibido');

                // Obtener información del usuario usando el access token
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                });

                const userInfo = await userInfoResponse.json();
                console.log('✅ Información del usuario obtenida:', userInfo.email);

                setStatus('Verificando permisos...');

                // Verificar usuario en el backend
                const url = `${import.meta.env.VITE_API_URL}/usuario/email/${userInfo.email}`;
                const response = await fetch(url);

                if (response.status === 404) {
                    setError('Esta cuenta de Google no está registrada. Contacta al administrador.');
                    setTimeout(() => navigate('/'), 3000);
                    return;
                }

                if (!response.ok) {
                    setError('Error al conectar con el servidor. Intenta de nuevo.');
                    setTimeout(() => navigate('/'), 3000);
                    return;
                }

                const usuario = await response.json();
                console.log('✅ Usuario encontrado:', usuario.nombre, '- Rol:', usuario.rol);

                // Verificar rol ADMIN
                if (usuario.rol !== 'ADMIN') {
                    setError('Acceso denegado. Solo administradores pueden acceder a esta plataforma.');
                    setTimeout(() => navigate('/'), 3000);
                    return;
                }

                // Guardar usuario y navegar al dashboard
                authService.saveUser(usuario);
                console.log('✅ Login con Google exitoso, redirigiendo al dashboard');
                navigate('/dashboard');

            } catch (err) {
                console.error('❌ Error inesperado:', err);
                setError('Error inesperado al autenticar. Intenta de nuevo.');
                setTimeout(() => navigate('/'), 3000);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
            color: 'white'
        }}>
            {error ? (
                <>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#ff4444',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '20px',
                        fontSize: '30px'
                    }}>
                        ✕
                    </div>
                    <h2 style={{ margin: '0 0 10px', fontWeight: 500 }}>{error}</h2>
                    <p style={{ opacity: 0.8 }}>Redirigiendo al inicio...</p>
                </>
            ) : (
                <>
                    {/* Spinner */}
                    <div style={{
                        border: '4px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '4px solid white',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '20px'
                    }} />
                    <h2 style={{ margin: 0, fontWeight: 500 }}>{status}</h2>
                    <style>
                        {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
                    </style>
                </>
            )}
        </div>
    );
};

export default GoogleCallback;
