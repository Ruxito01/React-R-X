// Configuración de la API del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090/api';

export const API_CONFIG = {
    baseURL: API_URL,
    endpoints: {
        // Usuarios
        usuarios: '/usuario',
        usuarioById: (id) => `/usuario/${id}`,
        usuarioByEmail: (email) => `/usuario/email/${email}`,
        login: '/usuario/login',

        // Otros endpoints que puedas necesitar
        comunidades: '/comunidad',
        vehiculos: '/vehiculo',
        rutas: '/ruta',
    },
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
};

// Helper para construir URLs completas
export const buildURL = (endpoint) => `${API_CONFIG.baseURL}${endpoint}`;

export default API_CONFIG;
