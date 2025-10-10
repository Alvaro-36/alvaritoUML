/****************
* Theme Helpers *
*****************/

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
  // Toggle entre dark y light
  const currentTheme = document.appConfig.theme;
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  // Actualizar configuración
  document.appConfig.theme = newTheme;
  
  // Cambiar tema del editor de Monaco
  if (newTheme === "dark") {
    document.appConfig.editorCreateOptions.theme = "vs-dark";
  } else {
    document.appConfig.editorCreateOptions.theme = "vs";
  }
  
  // Aplicar cambios
  setTheme(newTheme);
  document.editor?.updateOptions(document.appConfig.editorCreateOptions);
  
  // Guardar en localStorage
  updateConfig(document.appConfig);
  
  console.log(`🎨 Theme toggled to: ${newTheme}`);
}

function initTheme() {
  function getBrowserThemePreferences() {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return undefined;
  }
  function changeEditorThemeSettingIfNecessary(theme) {
    if (theme === "dark" && document.appConfig.editorCreateOptions.theme === "vs") {
      document.appConfig.editorCreateOptions.theme = "vs-dark";
    }
    if (theme === "light" && document.appConfig.editorCreateOptions.theme === "vs-dark") {
      document.appConfig.editorCreateOptions.theme = "vs";
    }
  }
  function onMediaColorPreferencesChanged(event) {
    const theme = event.matches ? "dark" : "light";
    document.appConfig.theme = theme
    changeEditorThemeSettingIfNecessary(theme);
    updateConfig(document.appConfig);
  }
  // set theme to last saved settings or browser preference or "dark" (default)
  document.appConfig.theme = document.appConfig.theme || getBrowserThemePreferences() || "dark";
  setTheme(document.appConfig.theme);
  changeEditorThemeSettingIfNecessary(document.appConfig.theme);
  // listen to browser change event
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", onMediaColorPreferencesChanged);
}
