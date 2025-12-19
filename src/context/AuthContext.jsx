import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Crear el contexto
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

// Provider del contexto
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cargar usuario de localStorage al iniciar
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    /**
     * Login con email y contraseña
     */
    const loginWithEmail = async (email, password) => {
        const result = await authService.loginWithEmail(email, password);

        if (result.success) {
            setUser(result.usuario);
            authService.saveUser(result.usuario);
        }

        return result;
    };

    /**
     * Login con Google
     */
    const loginWithGoogle = async (credential) => {
        const result = await authService.loginWithGoogle(credential);

        if (result.success) {
            setUser(result.usuario);
            authService.saveUser(result.usuario);
        }

        return result;
    };

    /**
     * Cerrar sesión
     */
    const logout = () => {
        setUser(null);
        authService.logout();
    };

    /**
     * Verificar si el usuario es admin
     */
    const isAdmin = () => {
        return user && user.rol === 'ADMIN';
    };

    const value = {
        user,
        loading,
        loginWithEmail,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
