/**
 * Cargador de configuración de Google Drive API
 * 
 * Este archivo es SEGURO para subir a Git/Vercel porque no contiene credenciales.
 * 
 * Funciona en dos modos:
 * 1. DESARROLLO: Lee credenciales desde google-drive-config.js (no en Git)
 * 2. PRODUCCIÓN: Lee credenciales desde variables de entorno inyectadas por Vercel
 */

(function() {
  // Intentar cargar desde variables de entorno inyectadas en el HTML (Vercel)
  const CLIENT_ID = window.GOOGLE_CLIENT_ID;
  const API_KEY = window.GOOGLE_API_KEY;
  
  // Si las variables de entorno están disponibles (producción en Vercel)
  if (CLIENT_ID && API_KEY) {
    console.log('✅ Cargando credenciales desde variables de entorno (Producción)');
    window.GOOGLE_DRIVE_CONFIG = {
      CLIENT_ID: CLIENT_ID,
      API_KEY: API_KEY,
      DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
      SCOPES: 'https://www.googleapis.com/auth/drive.file'
    };
  } 
  // Si no están disponibles, esperar que google-drive-config.js las defina (desarrollo)
  else {
    console.log('⚠️ Variables de entorno no encontradas. Usando google-drive-config.js (Desarrollo)');
    // google-drive-config.js debe cargar antes de google-drive-integration.js
    // y definirá window.GOOGLE_DRIVE_CONFIG
  }
})();
