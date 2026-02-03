/**
 * Utilidad para comprimir imagenes antes de subir al servidor
 * Usa Canvas API para redimensionar y comprimir
 */

/**
 * Comprime un archivo de imagen
 * @param {File} file - El archivo original
 * @param {number} maxWidth - Ancho maximo en pixeles (default 1000)
 * @param {number} quality - Calidad de compresion 0.0 - 1.0 (default 0.7)
 * @returns {Promise<File>} Archivo comprimido
 */
export const compressImage = (file, maxWidth = 1000, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        // Validar si es imagen
        if (!file.type.match(/image.*/)) {
            reject(new Error('El archivo no es una imagen'));
            return;
        }

        // Si es GIF, no comprimir para no perder animacion
        if (file.type === 'image/gif') {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calcular nuevas dimensiones
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // Crear canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a Blob/File
                // Mantenemos el tipo original si es soportado (jpeg/png/webp), sino jpeg
                const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Error al comprimir imagen'));
                        return;
                    }

                    // Log para debugging (puedes quitarlo en prod)
                    console.log(`Compresion: ${file.size} bytes -> ${blob.size} bytes`);

                    // Crear nuevo archivo con la data comprimida
                    const newFile = new File([blob], file.name, {
                        type: outputType,
                        lastModified: Date.now(),
                    });

                    resolve(newFile);
                }, outputType, quality);
            };

            img.onerror = (err) => reject(err);
        };

        reader.onerror = (err) => reject(err);
    });
};
