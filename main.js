const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6JklsOia4HVvuB3b81unFfUWKv79KXUmBQq7JsIUqK6XZPgpTrgArqpSs80rWMN4SEwtVUuYGDMNs/pub?gid=1882591302&single=true&output=csv';

let albumsData = {};

// 1. Cargar datos del Sheet
async function loadLibrary() {
    try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.split(','));
        
        // Agrupar por álbum
        rows.forEach((row, index) => {
            if (index === 0) return; // Saltar cabeceras si existen
            
            const [albumName, albumArt, trackTitle, trackUrl] = row;
            if (!albumName) return;

            if (!albumsData[albumName]) {
                albumsData[albumName] = {
                    name: albumName,
                    art: albumArt,
                    tracks: []
                };
            }
            albumsData[albumName].tracks.push({
                title: trackTitle,
                url: trackUrl
            });
        });

        renderAlbums();
    } catch (error) {
        console.error("Error cargando el Sheet:", error);
    }
}

// 2. Pintar álbumes en el Dashboard
function renderAlbums() {
    const grid = document.getElementById('album-grid');
    grid.innerHTML = '';

    Object.values(albumsData).forEach(album => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.innerHTML = `
            <div class="status-pill">${album.tracks.length} tracks</div>
            <img src="${album.art}" class="album-art" alt="${album.name}">
            <div class="album-info">
                <h3>${album.name}</h3>
                <p>Listo para sincronizar</p>
                <button class="auth-btn" style="margin-top: 10px; width: 100%; padding: 8px; border-radius: 8px; background: var(--accent-gold); border: none; font-weight: bold; cursor: pointer;" onclick="syncAlbum('${album.name}')">Subir a YouTube</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 3. Simulación de Sincronización (Próximo paso: Integrar YouTube & FFmpeg)
function syncAlbum(albumName) {
    const album = albumsData[albumName];
    const overlay = document.getElementById('render-overlay');
    overlay.style.display = 'flex';
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 10;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('render-status').innerText = `Procesando pista 1 de ${album.tracks.length}...`;
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            document.getElementById('render-status').innerText = "Simulación completada. En la versión final aquí se conectaría con la API de YouTube.";
            setTimeout(() => { overlay.style.display = 'none'; }, 2000);
        }
    }, 500);
}

// Inicializar
window.onload = loadLibrary;
