const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Servicio Real de YouTube v3 - Optimizado para GitHub Secrets
 */
async function uploadToYouTube(videoPath, songData) {
    console.log(`🚀 Preparando subida REAL a YouTube: ${songData.trackTitle}...`);
    
    // 1. Obtener Credenciales (Prioridad: Secretos de Entorno > Archivo Local)
    let credentials;
    if (process.env.YOUTUBE_CREDENTIALS_JSON) {
        credentials = JSON.parse(process.env.YOUTUBE_CREDENTIALS_JSON);
    } else if (fs.existsSync('credentials.json')) {
        credentials = JSON.parse(fs.readFileSync('credentials.json'));
    } else {
        console.warn('⚠️ No se encontraron credenciales. Simulación activa.');
        return 'SIMULATED_ID_' + Date.now();
    }

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // 2. Obtener Token (Prioridad: Secretos de Entorno > Archivo Local)
    let token;
    if (process.env.YOUTUBE_TOKEN_JSON) {
        token = JSON.parse(process.env.YOUTUBE_TOKEN_JSON);
    } else if (fs.existsSync('token.json')) {
        token = JSON.parse(fs.readFileSync('token.json'));
    } else {
        throw new Error('❌ No se encontró token de acceso (YOUTUBE_TOKEN_JSON).');
    }

    oAuth2Client.setCredentials(token);
    const youtube = google.youtube({ version: 'v3', auth: oAuth2Client });

    try {
        const res = await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: `${songData.trackTitle} - ${songData.albumName}`,
                    description: `Escucha "${songData.trackTitle}" del álbum "${songData.albumName}".\n\nGenerado de forma automática por MusiTube Automator.`,
                    tags: [songData.albumName, 'Música', 'MusiTube'],
                    categoryId: '10',
                },
                status: {
                    privacyStatus: 'public',
                    selfDeclaredMadeForKids: false,
                },
            },
            media: {
                body: fs.createReadStream(videoPath),
            },
        });

        console.log(`✅ ¡SUBIDA REAL EXITOSA! ID: ${res.data.id}`);
        return res.data.id;
    } catch (error) {
        console.error('❌ Error en YouTube Upload API:', error.message);
        throw error;
    }
}

module.exports = { uploadToYouTube };
