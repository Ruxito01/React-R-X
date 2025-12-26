/**
 * Servicio para manejar el almacenamiento de imagenes en Supabase Storage
 * Replica la funcionalidad del servicio de Flutter
 */

// Configuracion de Supabase
const SUPABASE_URL = 'https://fpgfqimjisbjzqggchmz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZ2ZxaW1qaXNianpxZ2djaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxOTA0NjEsImV4cCI6MjA3OTc2NjQ2MX0.cAahhJJQe3cfoWVlJbEZZdBtqv93oOQPqZt1SHfdZV8';

// Nombres de buckets
const BUCKETS = {
    TIPOS_VEHICULO: 'tipos-vehiculo',
    LOGROS: 'logros-iconos',
    VEHICULOS: 'fotos-vehiculos',
    USUARIOS: 'fotos-usuarios',
    COMUNIDADES: 'comunidades',
    MARCAS: 'logo-marcas'
};

/**
 * Sube una imagen a Supabase Storage
 * @param {File} file - Archivo a subir
 * @param {string} bucket - Nombre del bucket
 * @param {string} nombreArchivo - Nombre base para el archivo
 * @returns {Promise<string|null>} URL publica o null si falla
 */
export const subirImagen = async (file, bucket, nombreArchivo) => {
    try {
        console.log('Subiendo imagen a Supabase...');
        console.log('  Bucket:', bucket);
        console.log('  Nombre:', nombreArchivo);

        // Limpiar nombre para usarlo como filename
        const cleanName = nombreArchivo.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const extension = file.name.split('.').pop().toLowerCase();
        const fileName = `${cleanName}_${Date.now()}.${extension}`;

        console.log('  Archivo:', fileName);

        // Determinar content type
        let contentType = 'image/jpeg';
        if (extension === 'png') contentType = 'image/png';
        else if (extension === 'gif') contentType = 'image/gif';
        else if (extension === 'webp') contentType = 'image/webp';

        // Subir archivo
        const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': contentType,
                'x-upsert': 'true'
            },
            body: file
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al subir imagen:', errorText);
            return null;
        }

        // Construir URL publica
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
        console.log('Imagen subida exitosamente:', publicUrl);

        return publicUrl;

    } catch (error) {
        console.error('Error al subir imagen:', error);
        return null;
    }
};

/**
 * Elimina una imagen de Supabase Storage
 * @param {string} imageUrl - URL publica de la imagen
 * @param {string} bucket - Nombre del bucket
 * @returns {Promise<boolean>} true si se elimino correctamente
 */
export const eliminarImagen = async (imageUrl, bucket) => {
    try {
        if (!imageUrl) return true;

        console.log('Eliminando imagen de Supabase...');

        // Extraer el path del archivo desde la URL
        const urlParts = imageUrl.split(`/${bucket}/`);
        if (urlParts.length < 2) {
            console.error('No se pudo extraer el path del archivo');
            return false;
        }

        const filePath = urlParts[1];
        console.log('  Path:', filePath);

        const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            }
        });

        if (!response.ok) {
            console.error('Error al eliminar imagen');
            return false;
        }

        console.log('Imagen eliminada exitosamente');
        return true;

    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        return false;
    }
};

// Funciones especificas por tipo

export const subirImagenTipoVehiculo = (file, nombreTipo) =>
    subirImagen(file, BUCKETS.TIPOS_VEHICULO, nombreTipo);

export const eliminarImagenTipoVehiculo = (imageUrl) =>
    eliminarImagen(imageUrl, BUCKETS.TIPOS_VEHICULO);

export const subirImagenLogro = (file, nombreLogro) =>
    subirImagen(file, BUCKETS.LOGROS, nombreLogro);

export const eliminarImagenLogro = (imageUrl) =>
    eliminarImagen(imageUrl, BUCKETS.LOGROS);

export const subirImagenMarca = (file, nombreMarca) =>
    subirImagen(file, BUCKETS.MARCAS, nombreMarca);

export const eliminarImagenMarca = (imageUrl) =>
    eliminarImagen(imageUrl, BUCKETS.MARCAS);

export default {
    BUCKETS,
    subirImagen,
    eliminarImagen,
    subirImagenTipoVehiculo,
    eliminarImagenTipoVehiculo,
    subirImagenLogro,
    eliminarImagenLogro,
    subirImagenMarca,
    eliminarImagenMarca
};
