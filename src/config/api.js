// Configuración de la API del backend
// URLs definidas en .env
const URL_PROD = import.meta.env.VITE_API_URL_PROD || 'http://localhost:8090/api';
const URL_DEV = import.meta.env.VITE_API_URL_DEV || 'http://localhost:8090/api';

/**
 * Obtiene la URL base según el entorno seleccionado en localStorage.
 * Por defecto usa PROD si no hay selección.
 */
export const getBaseURL = () => {
    const selectedEnv = localStorage.getItem('selected_env');
    // Si es DEV explícitamente, usa la URL de Dev (Legacy)
    if (selectedEnv === 'DEV') return URL_DEV;
    // Por defecto (o si es PROD) usa la URL de Producción
    return URL_PROD;
};

// Mantenemos API_CONFIG para consistencia, pero baseURL ya no debería usarse directamente 
// si se busca dinamismo. Usar buildURL en su lugar.
export const API_CONFIG = {
    // Getter para compatibilidad, aunque buildURL es preferible
    get baseURL() { return getBaseURL(); },
    
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
        catalogoAvatar: '/catalogoavatar',
    },
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
};

// Helper para construir URLs completas dinámicamente
export const buildURL = (endpoint) => `${getBaseURL()}${endpoint}`;

export default API_CONFIG;
