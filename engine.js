const { getSongsFromSheet } = require('./src/services/sheets');
const { prepareAssets } = require('./src/services/downloader');
const { renderHighFidelityVideo } = require('./src/services/video');
const { uploadToYouTube } = require('./src/services/youtube');
const { sendNotification } = require('./src/services/telegram');
const { sanitizeFilename } = require('./src/utils/helpers');
const path = require('path');
const fs = require('fs');

async function main() {
    console.log('🤖 --- MUSITUBE AUTOMATOR: PILOTO AUTOMÁTICO ---');

    try {
        // 1. Obtener canciones
        const songs = await getSongsFromSheet();
        
        // 2. Filtrar la siguiente canción pendiente
        const nextSong = songs.find(s => s.status === 'Pending');

        if (!nextSong) {
            console.log('✅ No hay canciones pendientes por procesar. ¡Todo al día!');
            await sendNotification('✅ *MusiTube Automator*: No hay canciones pendientes hoy.');
            return;
        }

        console.log(`🎬 Procesando: "${nextSong.trackTitle}"...`);

        // 3. Preparar Assets
        const { image, audio } = await prepareAssets(nextSong);

        // 4. Renderizar Video
        const safeName = sanitizeFilename(nextSong.trackTitle);
        const outputPath = path.join(__dirname, `assets/temp/${safeName}.mp4`);
        await renderHighFidelityVideo(image, audio, outputPath);

        // 5. Subir a YouTube
        const youtubeId = await uploadToYouTube(outputPath, nextSong);

        // 6. Notificar
        await sendNotification(`🚀 *¡Nueva subida! *\n\n🎵 Canción: ${nextSong.trackTitle}\n💿 Álbum: ${nextSong.albumName}\n🔗 ID YouTube: ${youtubeId}`);

        // Limpieza de archivos temporales para mantener el Runner de GitHub limpio
        fs.unlinkSync(image);
        fs.unlinkSync(audio);
        // fs.unlinkSync(outputPath); // Descomentar después de validar subida real

        console.log('✨ Ciclo de hoy completado con éxito.');

    } catch (error) {
        console.error('💥 Error en el ciclo de hoy:', error);
        await sendNotification(`❌ *Fallo en el Piloto Automático*\nError: ${error.message}`);
    }
}

main();
