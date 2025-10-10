<link rel="stylesheet" href="menuStyle.css">
<link rel="stylesheet" href="https://unicons.iconscout.com/release/v2.1.9/css/unicons.css">

<div class="preview-menu">
  <div class="diagram-links flex-columns">
    <span>View as:</span>
    <a class="diagram-link" data-img-type="png" href="png/<%= diagramUrl %>" title="View diagram as PNG">
      <img src="assets/file-types/png.svg" alt="PNG" />
    </a>
    <a class="diagram-link" data-img-type="svg" href="svg/<%= diagramUrl %>" title="View diagram as SVG">
      <img src="assets/file-types/svg.svg" alt="SVG" />
    </a>
    <a class="diagram-link" data-img-type="txt" href="txt/<%= diagramUrl %>" title="View diagram as ASCII Art">
      <img src="assets/file-types/ascii.svg" alt="ASCII Art" />
    </a>
    <a class="diagram-link" data-img-type="pdf" href="pdf/<%= diagramUrl %>" title="View diagram as PDF">
      <img src="assets/file-types/pdf.svg" alt="PDF" />
    </a>
    <div>
        <button class="gsi-material-button" id="google-auth-button" onclick="handleGoogleAuthClick()">
          <div class="gsi-material-button-state"></div>
          <div class="gsi-material-button-content-wrapper">
            <div class="gsi-material-button-icon">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span class="gsi-material-button-contents">Sign in with Google</span>
            <span style="display: none;">Sign in with Google</span>
          </div>
        </button>
        
        <!-- Dropdown de archivos -->
        <div class="sec-center" id="files-dropdown" style="display: none; margin-top: 10px;">
          <input class="dropdown" type="checkbox" id="dropdown" name="dropdown"/>
          <label class="for-dropdown" for="dropdown">
            <span id="dropdown-title">Seleccionar proyecto</span> 
            <i class="uil uil-arrow-down"></i>
          </label>
          <div class="section-dropdown" id="section-dropdown">
            <!-- Los archivos se cargarán dinámicamente aquí -->
          </div>
        </div>
    </div>
    <a
      id="map-diagram-link"
      class="diagram-link"
      data-img-type="map"
      href="map/<%= diagramUrl %>"
      title="View diagram as Map Data"
      <% if (!hasMap) { %>
        style="display: none;"
      <% } %>
    >
        <img src="assets/file-types/map.svg" alt="MAP" />
    </a>
    <div class="flex-main menu-r">
      <div class="btn-float-r">
        <input
          id="btn-undock"
          class="btn-dock"
          type="image"
          src="assets/actions/undock.svg"
          alt="undock"
        />
        <input
          id="btn-dock"
          class="btn-dock"
          type="image"
          src="assets/actions/dock.svg"
          alt="dock"
          onclick="window.close();"
          style="display: none;"
        />
      </div>
    </div>
  </div>
</div>

<!-- IMPORTANTE: Primero cargamos nuestra configuración e integración, LUEGO los scripts de Google -->

<!-- Configuración de Google Drive: Variables de entorno o archivo local -->
<script>
  <%
    // Intentar cargar credenciales desde variables de entorno (para producción en Render)
    String clientId = System.getenv("GOOGLE_CLIENT_ID");
    String apiKey = System.getenv("GOOGLE_API_KEY");
    
    if (clientId != null && !clientId.isEmpty() && apiKey != null && !apiKey.isEmpty()) {
      // Usar variables de entorno (producción)
  %>
  window.GOOGLE_DRIVE_CONFIG = {
    CLIENT_ID: "<%= clientId %>",
    API_KEY: "<%= apiKey %>",
    DISCOVERY_DOC: "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    SCOPES: "https://www.googleapis.com/auth/drive"
  };
  console.log("Google Drive: Usando credenciales de variables de entorno (producción)");
  <%
    } else {
      // Usar archivo de configuración local (desarrollo)
  %>
  console.log("Google Drive: Usando credenciales de google-drive-config.js (desarrollo)");
  <%
    }
  %>
</script>

<!-- Cargar archivo de configuración local si no hay variables de entorno -->
<% if (clientId == null || clientId.isEmpty()) { %>
<script src="${pageContext.request.contextPath}/components/preview/menu/google-drive-config.js?v=<%= System.currentTimeMillis() %>"></script>
<% } %>

<!-- Cargar la integración que usa la configuración (ANTES de los scripts de Google) -->
<script src="${pageContext.request.contextPath}/components/preview/menu/google-drive-integration.js"></script>

<!-- Scripts de Google API (SE CARGAN AL FINAL para que encuentren las funciones gapiLoaded y gisLoaded) -->
<script async defer src="https://apis.google.com/js/api.js" onload="gapiLoaded()"></script>
<script async defer src="https://accounts.google.com/gsi/client" onload="gisLoaded()"></script>
