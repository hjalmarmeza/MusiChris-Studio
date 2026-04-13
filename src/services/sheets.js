const fetch = require('node-fetch');

// URL del Google Sheet publicado como CSV
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6JklsOia4HVvuB3b81unFfUWKv79KXUmBQq7JsIUqK6XZPgpTrgArqpSs80rWMN4SEwtVUuYGDMNs/pub?gid=1882591302&single=true&output=csv';

/**
 * Obtiene la lista de canciones desde el Google Sheet.
 * @returns {Promise<Array>} - Lista de objetos de canciones.
 */
async function getSongsFromSheet() {
    try {
        console.log('📡 Conectando con Google Sheets (CSV)...');
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        // Mapeamos los datos basándonos en la estructura observada
        // [albumName, albumArt, trackTitle, trackUrl, Status, YouTube ID, Playlist ID]
        const songs = lines.slice(1).map(line => {
            const values = line.split(',');
            if (values.length < 4) return null;
            
            return {
                albumName: values[0]?.trim(),
                albumArt: values[1]?.trim(),
                trackTitle: values[2]?.trim(),
                trackUrl: values[3]?.trim(),
                status: values[4]?.trim() || 'Pending',
                youtubeId: values[5]?.trim() || '',
                playlistId: values[6]?.trim() || ''
            };
        }).filter(song => song && song.trackTitle);

        console.log(`✅ Se encontraron ${songs.length} canciones.`);
        return songs;
    } catch (error) {
        console.error('❌ Error leyendo el Sheet:', error);
        throw error;
    }
}

module.exports = { getSongsFromSheet };
