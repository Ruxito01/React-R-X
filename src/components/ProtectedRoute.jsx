import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación de ADMIN
 */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Mientras se carga el usuario, mostrar un loading
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#000',
                color: '#fff'
            }}>
                <p>Cargando...</p>
            </div>
        );
    }

    // Si no hay usuario, redirigir al login
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Si el usuario no es ADMIN, mostrar mensaje y redirigir
    if (user.rol !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    // Si todo está bien, mostrar el contenido protegido
    return children;
};

export default ProtectedRoute;
