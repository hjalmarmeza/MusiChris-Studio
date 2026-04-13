const { getSongsFromSheet } = require('../src/services/sheets');
const { prepareAssets } = require('../src/services/downloader');
const { renderHighFidelityVideo } = require('../src/services/video');
const { sendNotification } = require('../src/services/telegram');
const { sanitizeFilename } = require('../src/utils/helpers');
const fs = require('fs');
const path = require('path');

async function runIntegrationTest() {
    console.log('🚀 --- INICIANDO PRUEBA DE INTEGRACIÓN: SHEET -> RENDER ---');

    try {
        // 1. Leer el Sheet
        const songs = await getSongsFromSheet();
        if (songs.length === 0) {
            console.error('❌ No se encontraron canciones en el Sheet.');
            return;
        }

        // 2. Elegir una canción al azar (o la primera)
        const targetSong = songs[0];
        console.log(`🎯 Canción seleccionada: "${targetSong.trackTitle}" de [${targetSong.albumName}]`);

        // 3. Descargar Assets
        const { image, audio } = await prepareAssets(targetSong);

        // 4. Renderizar Video con el nombre de la canción
        const safeName = sanitizeFilename(targetSong.trackTitle);
        const outputPath = path.join(__dirname, `../assets/temp/${safeName}.mp4`);
        await renderHighFidelityVideo(image, audio, outputPath);

        // 5. Notificar Éxito
        const stats = fs.statSync(outputPath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        console.log(`\n✅ PRUEBA COMPLETADA CON ÉXITO`);
        console.log(`📦 Video Final: ${outputPath} (${fileSizeMB} MB)`);

        await sendNotification(`✅ *Prueba de Integración Exitosa*\n\n🎬 Video: ${targetSong.trackTitle}\n💿 Álbum: ${targetSong.albumName}\n📦 Tamaño: ${fileSizeMB} MB`);

        // Limpieza (Opcional, para la prueba lo mantendremos para que el usuario lo vea)
        // fs.unlinkSync(image);
        // fs.unlinkSync(audio);

    } catch (error) {
        console.error('\n💥 Fallo en la prueba de integración:', error);
        await sendNotification(`❌ *Fallo en la prueba de integración*\nError: ${error.message}`);
    }
}

runIntegrationTest();
