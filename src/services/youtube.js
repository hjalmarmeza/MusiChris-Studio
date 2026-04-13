const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Servicio Real de YouTube v3
 */
async function uploadToYouTube(videoPath, songData) {
    console.log(`🚀 Preparando subida REAL a YouTube: ${songData.trackTitle}...`);
    
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    const tokenPath = path.join(process.cwd(), 'token.json');

    if (!fs.existsSync(credentialsPath)) {
        console.warn('⚠️ No se encontró credentials.json. Simulación activa.');
        return 'SIMULATED_ID';
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // En GitHub Actions, el token vendrá de una variable de entorno
    let token;
    if (process.env.YOUTUBE_TOKEN_JSON) {
        token = JSON.parse(process.env.YOUTUBE_TOKEN_JSON);
    } else if (fs.existsSync(tokenPath)) {
        token = JSON.parse(fs.readFileSync(tokenPath));
    } else {
        throw new Error('❌ No se encontró token de acceso (token.json o secreto YOUTUBE_TOKEN_JSON).');
    }

    oAuth2Client.setCredentials(token);

    const youtube = google.youtube({ version: 'v3', auth: oAuth2Client });

    try {
        const res = await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: `${songData.trackTitle} - ${songData.albumName}`,
                    description: `Escucha "${songData.trackTitle}" del álbum "${songData.albumName}".\n\nGenerado automáticamente por MusiTube Automator.`,
                    tags: [songData.albumName, 'MusiTube', 'Music'],
                    categoryId: '10', // Música
                },
                status: {
                    privacyStatus: 'public', // Puedes cambiarlo a 'unlisted' para pruebas
                    selfDeclaredMadeForKids: false,
                },
            },
            media: {
                body: fs.createReadStream(videoPath),
            },
        });

        console.log(`✅ ¡Video subido con éxito! ID: ${res.data.id}`);
        return res.data.id;
    } catch (error) {
        console.error('❌ Error en YouTube Upload API:', error.message);
        throw error;
    }
}

module.exports = { uploadToYouTube };
