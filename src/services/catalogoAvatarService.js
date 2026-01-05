import { API_CONFIG, buildURL } from '../config/api';

/**
 * Servicio para gestionar el catálogo de avatares 3D
 */
class CatalogoAvatarService {

    /**
     * Obtener todos los avatares
     * @returns {Promise<Array>} Lista de avatares
     */
    async obtenerTodos() {
        try {
            const response = await fetch(buildURL(API_CONFIG.endpoints.catalogoAvatar), {
                method: 'GET',
                headers: API_CONFIG.headers
            });
            if (!response.ok) throw new Error('Error al obtener avatares');
            return await response.json();
        } catch (error) {
            console.error('Error en obtenerTodos:', error);
            return [];
        }
    }

    /**
     * Obtener avatar por ID
     * @param {number} id 
     */
    async obtenerPorId(id) {
        try {
            const response = await fetch(buildURL(`${API_CONFIG.endpoints.catalogoAvatar}/${id}`), {
                method: 'GET',
                headers: API_CONFIG.headers
            });
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Error en obtenerPorId:', error);
            return null;
        }
    }

    /**
     * Crear un nuevo avatar
     * @param {object} avatarData - { nombre, descripcion, urlModelo3d, esPremium, ... }
     */
    async crear(avatarData) {
        try {
            const response = await fetch(buildURL(API_CONFIG.endpoints.catalogoAvatar), {
                method: 'POST',
                headers: API_CONFIG.headers,
                body: JSON.stringify(avatarData)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Error al crear avatar: ${response.status} - ${errorBody}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en crear:', error);
            return null;
        }
    }

    /**
     * Actualizar un avatar existente
     * @param {number} id 
     * @param {object} avatarData 
     */
    async actualizar(id, avatarData) {
        try {
            const response = await fetch(buildURL(`${API_CONFIG.endpoints.catalogoAvatar}/${id}`), {
                method: 'PUT',
                headers: API_CONFIG.headers,
                body: JSON.stringify(avatarData)
            });

            if (!response.ok) {
                throw new Error(`Error al actualizar avatar: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en actualizar:', error);
            return null;
        }
    }

    /**
     * Eliminar un avatar
     * @param {number} id 
     */
    async eliminar(id) {
        try {
            const response = await fetch(buildURL(`${API_CONFIG.endpoints.catalogoAvatar}/${id}`), {
                method: 'DELETE',
                headers: API_CONFIG.headers
            });
            return response.ok;
        } catch (error) {
            console.error('Error en eliminar:', error);
            return false;
        }
    }

    // ========== MÉTODOS DE COLECCIÓN (Si se necesitaran en admin para pruebas) ==========

    // Por ahora solo CRUD básico es necesario para el administrador.
}

const catalogoAvatarService = new CatalogoAvatarService();
export default catalogoAvatarService;
