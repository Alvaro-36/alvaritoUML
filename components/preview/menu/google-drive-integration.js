/**
 * Integración de Google Drive con PlantUML Server
 * Este archivo maneja la autenticación, creación de carpetas y gestión de archivos
 * 
 * IMPORTANTE: Las credenciales se cargan desde:
 * 1. Variables de entorno (producción en Render): window.GOOGLE_DRIVE_CONFIG
 * 2. Archivo local (desarrollo): google-drive-config.js
 * Ver google-drive-config.example.js para más información
 */

// Verificar que GOOGLE_DRIVE_CONFIG esté definido
if (typeof GOOGLE_DRIVE_CONFIG === 'undefined') {
  console.error('❌ GOOGLE_DRIVE_CONFIG no está definido!');
  console.error('Asegúrate de:');
  console.error('1. Tener el archivo google-drive-config.js en desarrollo, O');
  console.error('2. Configurar GOOGLE_CLIENT_ID y GOOGLE_API_KEY en variables de entorno para producción');
  throw new Error('GOOGLE_DRIVE_CONFIG no está definido');
}

// Configuración de Google API
const CLIENT_ID = GOOGLE_DRIVE_CONFIG.CLIENT_ID;
const API_KEY = GOOGLE_DRIVE_CONFIG.API_KEY;
const DISCOVERY_DOC = GOOGLE_DRIVE_CONFIG.DISCOVERY_DOC;
const SCOPES = GOOGLE_DRIVE_CONFIG.SCOPES;

console.log('✅ Google Drive configurado correctamente');
console.log('   Client ID:', CLIENT_ID ? CLIENT_ID.substring(0, 20) + '...' : 'NO DEFINIDO');
console.log('   API Key:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'NO DEFINIDO');

let tokenClient;
let gapiInited = false;
let gisInited = false;
let workFolderId = null; // ID de la carpeta de trabajo
window.selectedFileId = null; // ID del archivo actualmente seleccionado (global)

/**
 * Callback después de cargar api.js
 */
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

/**
 * Callback después de que el cliente API está cargado
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
  checkExistingSession();
}

/**
 * Callback después de cargar Google Identity Services
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '',
    prompt: ''
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Habilita la interacción del usuario después de cargar las librerías
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    const authButton = document.getElementById('google-auth-button');
    if (authButton) {
      authButton.disabled = false;
    }
  }
}

/**
 * Verifica si existe una sesión activa
 */
async function checkExistingSession() {
  const savedToken = localStorage.getItem('google_access_token');
  const tokenExpiry = localStorage.getItem('google_token_expiry');
  
  if (savedToken && tokenExpiry) {
    const now = Date.now();
    const expiryTime = parseInt(tokenExpiry);
    
    if (now < expiryTime) {
      console.log('Token guardado encontrado y válido, restaurando sesión...');
      
      gapi.client.setToken({
        access_token: savedToken
      });
      
      try {
        await gapi.client.drive.files.list({
          pageSize: 1,
          fields: 'files(id)'
        });
        
        console.log('Sesión restaurada exitosamente');
        await onAuthSuccess();
        return;
      } catch (error) {
        console.log('Token guardado inválido, limpiando...');
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_token_expiry');
        gapi.client.setToken(null);
      }
    } else {
      console.log('Token guardado expirado, limpiando...');
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_token_expiry');
    }
  }
}

/**
 * Manejador del click en el botón de autorización de Google
 */
function handleGoogleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      console.error('Error en autenticación:', resp);
      return;
    }

    // Guardar el token en localStorage
    if (resp.access_token) {
      const expiryTime = Date.now() + (3600 * 1000); // 1 hora
      localStorage.setItem('google_access_token', resp.access_token);
      localStorage.setItem('google_token_expiry', expiryTime.toString());
      console.log('Token guardado en localStorage');
    }

    await onAuthSuccess();
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    tokenClient.requestAccessToken({prompt: ''});
  }
}

/**
 * Ejecutado después de una autenticación exitosa
 */
async function onAuthSuccess() {
  try {
    // Crear o recuperar la carpeta de trabajo
    workFolderId = await crearCarpetaTrabajo();
    console.log('Carpeta de trabajo ID:', workFolderId);
    
    // Ocultar el botón de auth y mostrar el dropdown
    const authButton = document.getElementById('google-auth-button');
    const dropdown = document.getElementById('files-dropdown');
    
    if (authButton) authButton.style.display = 'none';
    if (dropdown) dropdown.style.display = 'block';
    
    // Cargar los archivos en el dropdown
    await cargarArchivosEnDropdown(workFolderId);
    
  } catch (error) {
    console.error('Error en onAuthSuccess:', error);
  }
}

/**
 * Crea o recupera la carpeta de trabajo 'plantUMLsaves'
 */
async function crearCarpetaTrabajo() {
  const resp = await gapi.client.drive.files.list({
    q: "mimeType='application/vnd.google-apps.folder' and name contains 'plantUMLsaves' and trashed=false",
    fields: "files(id, name, parents)",
  });

  const files = (resp.result && resp.result.files) || [];
  
  if (files.length > 0) {
    console.log('Carpeta existente encontrada:', files[0]);
    return files[0].id;
  }

  try {
    const fileMetadata = {
      name: 'plantUMLsaves',
      mimeType: 'application/vnd.google-apps.folder',
    };

    const createResp = await gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });

    const createdId = createResp.result && createResp.result.id;
    console.log('Carpeta creada con id:', createdId);
    return createdId;
  } catch (error) {
    console.error("Error al crear la carpeta de trabajo", error);
    throw error;
  }
}

/**
 * Carga los archivos de la carpeta de trabajo y los muestra en el dropdown
 */
async function cargarArchivosEnDropdown(folderId) {
  try {
    console.log('Cargando archivos de la carpeta:', folderId);
    
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
      fields: 'files(id, name, size, mimeType)',
      supportsAllDrives: true,
      pageSize: 100
    });

    const files = (response.result && response.result.files) || [];
    const nonEmptyFiles = files.filter(file => {
      const size = parseInt(file.size) || 0;
      return size > 0;
    });

    console.log(`Encontrados ${nonEmptyFiles.length} archivos no vacíos`);

    const dropdownContainer = document.getElementById('section-dropdown');
    const dropdownTitle = document.getElementById('dropdown-title');
    
    if (!dropdownContainer) {
      console.error('No se encontró el contenedor del dropdown');
      return;
    }

    dropdownContainer.innerHTML = '';

    // Crear enlaces para cada archivo
    nonEmptyFiles.forEach(file => {
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = file.name;
      link.dataset.fileId = file.id;
      link.dataset.fileName = file.name;
      
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        dropdownTitle.textContent = file.name;
        document.getElementById('dropdown').checked = false;
        console.log('Archivo seleccionado:', file.name, 'ID:', file.id);
        
        window.selectedFileId = file.id;
        await cargarArchivoEnEditor(file.id, file.name);
      });
      
      dropdownContainer.appendChild(link);
    });

    // Agregar botón "Crear nuevo archivo" al final
    const newFileLink = document.createElement('a');
    newFileLink.href = '#';
    newFileLink.textContent = '+ Crear nuevo archivo';
    newFileLink.style.fontWeight = 'bold';
    newFileLink.style.borderTop = '1px solid #333';
    newFileLink.style.marginTop = '5px';
    newFileLink.style.paddingTop = '10px';
    
    newFileLink.addEventListener('click', async (e) => {
      e.preventDefault();
      document.getElementById('dropdown').checked = false;
      await crearNuevoArchivo();
    });
    
    dropdownContainer.appendChild(newFileLink);

    if (nonEmptyFiles.length === 0) {
      const emptyMsg = document.createElement('a');
      emptyMsg.href = '#';
      emptyMsg.textContent = 'No hay archivos';
      emptyMsg.style.pointerEvents = 'none';
      emptyMsg.style.opacity = '0.5';
      dropdownContainer.insertBefore(emptyMsg, newFileLink);
    }

  } catch (err) {
    console.error('Error cargando archivos en dropdown:', err);
  }
}

/**
 * Carga el contenido de un archivo en el editor
 */
async function cargarArchivoEnEditor(fileId, fileName) {
  try {
    console.log(`Cargando archivo en editor: ${fileName}`);
    
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
      supportsAllDrives: true
    });

    const contenido = response.body;
    console.log('Contenido del archivo cargado:', contenido.substring(0, 200));
    
    // Actualizar el editor de Monaco directamente con el contenido tal cual
    if (document.editor && typeof setEditorValue === 'function') {
      setEditorValue(document.editor, contenido, { 
        suppressEditorChangedMessage: false,
        forceMoveMarkers: true 
      });
      console.log('Contenido cargado en el editor de Monaco');
    } else {
      console.error('Editor de Monaco no disponible o función setEditorValue no encontrada');
    }
    
    return contenido;
  } catch (err) {
    console.error('Error cargando archivo en editor:', err);
    throw err;
  }
}

/**
 * Crea un nuevo archivo con el contenido actual del editor
 */
async function crearNuevoArchivo() {
  try {
    // Pedir nombre al usuario
    const nombreArchivo = prompt('Ingrese el nombre del archivo:', 'nuevo-diagrama.puml');
    
    if (!nombreArchivo) {
      console.log('Creación de archivo cancelada');
      return;
    }

    // Obtener el URL actual de la página (campo url que contiene el código encoded)
    let contenidoActual = '';
    const urlInput = document.getElementById('url');
    if (urlInput && urlInput.value) {
      contenidoActual = urlInput.value;
    }
    
    // Si el campo url está vacío, usar el contenido del editor
    if (!contenidoActual || contenidoActual.trim() === '') {
      if (document.editor) {
        contenidoActual = document.editor.getValue();
      }
    }

    console.log('Creando nuevo archivo:', nombreArchivo);
    console.log('Contenido inicial:', contenidoActual.substring(0, 100));

    // Crear el archivo usando la función del script
    const trimmedName = nombreArchivo.trim();
    const name = /\.[^./\\]+$/.test(trimmedName) ? trimmedName : `${trimmedName}.puml`;

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
      name: name,
      mimeType: 'text/plain',
      parents: [workFolderId]
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/plain\r\n\r\n' +
      contenidoActual +
      close_delim;

    const request = gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: {
        uploadType: 'multipart',
        supportsAllDrives: true,
        fields: 'id, name, parents'
      },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: multipartRequestBody
    });

    const res = await request;
    console.log('Archivo creado:', res.result);
    
    window.selectedFileId = res.result.id;
    
    // Recargar la lista de archivos
    await cargarArchivosEnDropdown(workFolderId);
    
    // Actualizar el título del dropdown
    const dropdownTitle = document.getElementById('dropdown-title');
    if (dropdownTitle) {
      dropdownTitle.textContent = name;
    }

  } catch (err) {
    console.error('Error creando nuevo archivo:', err);
    alert('Error al crear el archivo: ' + (err.message || err));
  }
}

/**
 * Actualiza el contenido del archivo seleccionado en Google Drive
 */
async function actualizarArchivoSeleccionado(contenido) {
  if (!window.selectedFileId) {
    console.log('No hay archivo seleccionado para actualizar');
    return;
  }

  try {
    console.log(`Actualizando archivo ID: ${window.selectedFileId}`);
    
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
      mimeType: 'text/plain'
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/plain\r\n\r\n' +
      contenido +
      close_delim;

    const request = gapi.client.request({
      path: `/upload/drive/v3/files/${window.selectedFileId}`,
      method: 'PATCH',
      params: {
        uploadType: 'multipart',
        supportsAllDrives: true,
        fields: 'id, name, modifiedTime'
      },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: multipartRequestBody
    });

    const response = await request;
    console.log('Archivo actualizado exitosamente:', response.result);
    
    return response.result;
  } catch (err) {
    console.error('Error actualizando archivo:', err);
    throw err;
  }
}

// Cargar las librerías de Google al cargar la página
if (typeof gapi !== 'undefined') {
  gapiLoaded();
}

//AGREGAR QUE CUANDO SE TOQUE EL BOTON DE CAMBIAR DOCUMETNO SE GUARDE EL PROGRESO
// const saveBeforeExitListener = document.querySelector("#files-dropdown").addEventListener("click", alert("TEST"))
// Exponer funciones globalmente
window.handleGoogleAuthClick = handleGoogleAuthClick;
window.actualizarArchivoSeleccionado = actualizarArchivoSeleccionado;
