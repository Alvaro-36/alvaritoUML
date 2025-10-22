/*****************
* Editor Menu JS *
******************/

function initEditorMenu() {
  function copyCodeToClipboard() {
    const range = document.editor.getModel().getFullModelRange();
    document.editor.focus();
    document.editor.setSelection(range);
    const code = document.editor.getValue();
    navigator.clipboard?.writeText(code).catch(() => {});
  }
  // add listener
  const copyButton = document.getElementById("menu-item-editor-code-copy");
  if (copyButton) {
    copyButton.addEventListener("click", copyCodeToClipboard);
  } else {
    console.warn('Elemento "menu-item-editor-code-copy" no encontrado en el DOM');
  }
}
