/**
 * Sanitiza un string para que sea seguro usarlo como nombre de archivo.
 * @param {string} text - El texto a sanitizar.
 * @returns {string} - Texto limpio (sin espacios raros ni caracteres especiales).
 */
function sanitizeFilename(text) {
    return text
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
        .replace(/[^a-z0-9]/g, '_') // Cambiar todo lo no-alfanumérico por guiones bajos
        .replace(/_{2,}/g, '_')     // No permitir múltiples guiones bajos seguidos
        .trim();
}

module.exports = { sanitizeFilename };
