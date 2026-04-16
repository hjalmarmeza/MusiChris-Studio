const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

/**
 * Descarga un archivo desde una URL.
 * @param {string} url - URL del archivo.
 * @param {string} destination - Ruta local donde guardar.
 * @returns {Promise<string>} - Ruta local del archivo descargado.
 */
async function downloadFile(url, destination) {
    const res = await fetch(url);
    const fileStream = fs.createWriteStream(destination);
    return new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", () => resolve(destination));
    });
}

/**
 * Prepara los assets locales para una canción específica.
 * @param {Object} song - Objeto canción del sheet.
 * @returns {Promise<Object>} - Rutas locales { image, audio }.
 */
async function prepareAssets(song) {
    const tempDir = path.join(__dirname, '../../assets/temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const imagePath = path.join(tempDir, `cover_${Date.now()}.png`);
    const audioPath = path.join(tempDir, `audio_${Date.now()}.mp3`);

    console.log(`📥 Descargando assets para: ${song.trackTitle}...`);
    
    await Promise.all([
        downloadFile(song.albumArt, imagePath),
        downloadFile(song.trackUrl, audioPath)
    ]);

    return { image: imagePath, audio: audioPath, tempPaths: [imagePath, audioPath] };
}

/**
 * Elimina archivos temporales tras cada iteración para mantener el servidor limpio.
 * @param {string[]} filePaths - Lista de rutas a eliminar.
 */
function cleanupTempFiles(filePaths = []) {
    for (const filePath of filePaths) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
            console.warn(`⚠️ No se pudo borrar: ${filePath}`);
        }
    }
}

module.exports = { prepareAssets, cleanupTempFiles };
