/**
 * Configuración de Google Drive API
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo y renómbralo a: google-drive-config.js
 * 2. Reemplaza los valores con tus propias credenciales de Google Cloud Console
 * 3. NO subas google-drive-config.js al repositorio (está en .gitignore)
 * 
 * Para obtener tus credenciales:
 * 1. Ve a: https://console.cloud.google.com/
 * 2. Crea un nuevo proyecto o selecciona uno existente
 * 3. Habilita la API de Google Drive
 * 4. Crea credenciales (OAuth 2.0 Client ID y API Key)
 */

const GOOGLE_DRIVE_CONFIG = {
  CLIENT_ID: 'TU_CLIENT_ID_AQUI.apps.googleusercontent.com',
  API_KEY: 'TU_API_KEY_AQUI',
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  SCOPES: 'https://www.googleapis.com/auth/drive'
};
