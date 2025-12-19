import { API_CONFIG, buildURL } from '../config/api';

/**
 * Servicio de autenticación
 * Maneja login con email/password y Google OAuth
 * Solo verifica usuarios existentes, NO crea nuevos usuarios
 */
class AuthService {

    /**
     * Login con email y contraseña
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{success: boolean, message: string, usuario?: object}>}
     */
    async loginWithEmail(email, password) {
        try {
            console.log('🔵 Iniciando login con email:', email);

            const url = buildURL(API_CONFIG.endpoints.login);
            const response = await fetch(url, {
                method: 'POST',
                headers: API_CONFIG.headers,
                body: JSON.stringify({
                    email: email,
                    contrasena: password
                })
            });

            console.log('📡 Response status:', response.status);

            if (response.status === 401) {
                console.log('❌ Credenciales incorrectas');
                return {
                    success: false,
                    message: 'Credenciales incorrectas. Verifica tu email y contraseña.'
                };
            }

            if (!response.ok) {
                console.log('❌ Error del servidor:', response.status);
                return {
                    success: false,
                    message: 'Error al conectar con el servidor. Intenta de nuevo.'
                };
            }

            const usuario = await response.json();
            console.log('✅ Usuario encontrado:', usuario.nombre, '- Rol:', usuario.rol);

            // Verificar que sea ADMIN
            if (usuario.rol !== 'ADMIN') {
                console.log('❌ Usuario no es ADMIN');
                return {
                    success: false,
                    message: 'Acceso denegado. Solo administradores pueden acceder a esta plataforma.'
                };
            }

            console.log('✅ Login exitoso como ADMIN');
            return {
                success: true,
                message: 'Inicio de sesión exitoso',
                usuario: usuario
            };

        } catch (error) {
            console.error('❌ Error en loginWithEmail:', error);
            return {
                success: false,
                message: 'Error de conexión. Verifica tu internet e intenta de nuevo.'
            };
        }
    }

    /**
     * Login con Google OAuth
     * Decodifica el token de Google y verifica que el usuario exista en el backend
     * @param {string} credential - JWT token de Google
     * @returns {Promise<{success: boolean, message: string, usuario?: object}>}
     */
    async loginWithGoogle(credential) {
        try {
            console.log('🔵 Iniciando login con Google');

            // Decodificar el JWT de Google (solo el payload, sin verificar firma)
            const payload = this.parseJwt(credential);
            console.log('✅ Token de Google decodificado:', payload.email);

            // Verificar que el usuario exista en el backend
            const email = payload.email;
            const url = buildURL(API_CONFIG.endpoints.usuarioByEmail(email));

            console.log('🔵 Buscando usuario en backend:', email);
            const response = await fetch(url, {
                method: 'GET',
                headers: API_CONFIG.headers
            });

            if (response.status === 404) {
                console.log('❌ Usuario no encontrado en el backend');
                return {
                    success: false,
                    message: 'Esta cuenta de Google no está registrada. Contacta al administrador.'
                };
            }

            if (!response.ok) {
                console.log('❌ Error del servidor:', response.status);
                return {
                    success: false,
                    message: 'Error al conectar con el servidor. Intenta de nuevo.'
                };
            }

            const usuario = await response.json();
            console.log('✅ Usuario encontrado:', usuario.nombre, '- Rol:', usuario.rol);

            // Verificar que sea ADMIN
            if (usuario.rol !== 'ADMIN') {
                console.log('❌ Usuario no es ADMIN');
                return {
                    success: false,
                    message: 'Acceso denegado. Solo administradores pueden acceder a esta plataforma.'
                };
            }

            console.log('✅ Login con Google exitoso como ADMIN');
            return {
                success: true,
                message: 'Inicio de sesión exitoso',
                usuario: usuario
            };

        } catch (error) {
            console.error('❌ Error en loginWithGoogle:', error);
            return {
                success: false,
                message: 'Error al autenticar con Google. Intenta de nuevo.'
            };
        }
    }

    /**
     * Decodifica un JWT (solo el payload, sin verificar firma)
     * @param {string} token 
     * @returns {object}
     */
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error al decodificar JWT:', error);
            return {};
        }
    }

    /**
     * Guardar usuario en localStorage
     * @param {object} usuario 
     */
    saveUser(usuario) {
        localStorage.setItem('currentUser', JSON.stringify(usuario));
    }

    /**
     * Obtener usuario actual de localStorage
     * @returns {object|null}
     */
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    /**
     * Verificar si hay un usuario autenticado
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    /**
     * Verificar si el usuario actual es ADMIN
     * @returns {boolean}
     */
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.rol === 'ADMIN';
    }

    /**
     * Cerrar sesión
     */
    logout() {
        localStorage.removeItem('currentUser');
        console.log('✅ Sesión cerrada');
    }
}

// Exportar una instancia única (singleton)
const authService = new AuthService();
export default authService;
