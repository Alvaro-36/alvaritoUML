/**
 * Inicialización de la aplicación AlvaritoUML
 * Este archivo debe cargarse ANTES de los demás scripts
 */

// Inicializar document.appData
if (!document.appData) {
  document.appData = {
    encodedDiagram: "SyfFKj2rKt3CoKnELR1Io4ZDoSa70000", // Diagrama por defecto (Bob -> Alice : hello)
    index: undefined,
    numberOfDiagramPages: 1
  };
  console.log("✅ document.appData inicializado:", document.appData);
}

// Inicializar document.appConfig
if (!document.appConfig) {
  document.appConfig = {
    diagramPreviewType: "png", // Por defecto PNG
    editorWatcherTimeout: 500, // 500ms de espera antes de actualizar
    autoRefreshState: "idle"
  };
  console.log("✅ document.appConfig inicializado:", document.appConfig);
}
