const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

// Configuración de la ruta de FFmpeg para el entorno local (macOS Homebrew)
// En GitHub Actions se usará la ruta del sistema automáticamente.
if (process.platform === 'darwin') {
    ffmpeg.setFfmpegPath('/opt/homebrew/bin/ffmpeg');
}

/**
 * Renderiza un video de alta fidelidad uniendo una imagen y un audio.
 * @param {string} imagePath - Ruta local a la portada.
 * @param {string} audioPath - Ruta local al audio (MP3/WAV).
 * @param {string} outputPath - Donde se guardará el video final.
 * @returns {Promise<string>} - Ruta del video generado.
 */
async function renderHighFidelityVideo(imagePath, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`🎬 Iniciando render: ${path.basename(audioPath)}...`);
        
        ffmpeg()
            .input(imagePath)
            .loop() // Repetir la imagen
            .input(audioPath)
            .audioCodec('aac')
            .audioBitrate('192k')
            .videoCodec('libx264')
            .outputOptions([
                '-tune stillimage', 
                '-pix_fmt yuv420p',
                '-shortest', 
                '-preset medium',
                '-crf 18',
                '-vf scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black' 
            ])
            .on('progress', (progress) => {
                if (progress.percent) {
                    console.log(`⏳ Renderizando: ${Math.round(progress.percent)}%`);
                }
            })
            .on('error', (err) => {
                console.error('❌ Error FFmpeg:', err.message);
                reject(err);
            })
            .on('end', () => {
                console.log('✅ Render completado:', outputPath);
                resolve(outputPath);
            })
            .save(outputPath);
    });
}

module.exports = { renderHighFidelityVideo };
