/************
* Editor JS *
*************/

const { setEditorValue, initEditor } = (function() {
  function setEditorValue(
    editor,
    text,
    { suppressEditorChangedMessage=false, forceMoveMarkers=undefined } = {}
  ) {
    if (suppressEditorChangedMessage && editor === document.editor) {
      suppressNextMessage("editor");
    }
    // replace editor value but preserve undo stack
    editor.executeEdits("", [{ range: editor.getModel().getFullModelRange(),  text, forceMoveMarkers }]);
  }

  async function initEditor(view) {
    function loadMonacoCodeEditorAsync() {
      return new Promise((resolve, _reject) => {
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' } });
        require(["vs/editor/editor.main"], resolve);
      });
    }
    function createEditorModel() {
      let plantumlFeatures;
      function onPlantumlEditorContentChanged(code, sender=undefined, broadcastChanges=true) {
        function broadcastCodeEditorChanges() {
          // Asegurar que appData y appConfig existan
          if (!document.appData) {
            document.appData = {
              encodedDiagram: undefined,
              index: undefined,
              numberOfDiagramPages: 1
            };
          }
          if (!document.appConfig) {
            document.appConfig = {
              diagramPreviewType: "png",
              editorWatcherTimeout: 500,
              autoRefreshState: "idle"
            };
          }
          
          document.appConfig.autoRefreshState = "started";
          const numberOfDiagramPages = getNumberOfDiagramPagesFromCode(code);
          let index = document.appData.index;
          if (index === undefined || numberOfDiagramPages === 1) {
            index = undefined;
          } else if (index >= numberOfDiagramPages) {
            index = numberOfDiagramPages - 1;
          }
          // Codificar localmente usando encodePlantUML en lugar de hacer POST al servidor
          try {
            const encodedDiagram = encodePlantUML(code);
            console.log('✅ Diagram encoded locally:', encodedDiagram);
            document.querySelector('#url').value = `https://editor.plantuml.com/map/${encodedDiagram}`;
            document.querySelector('#diagram-png').src = `https://img.plantuml.biz/plantuml/png/${encodedDiagram}`
            console.log(`https://img.plantuml.biz/plantuml/png/${encodedDiagram}`);

            //Actualizar los botones
            document.querySelector('#diagram-png').src = `https://img.plantuml.biz/plantuml/png/${encodedDiagram}`
            
            // Actualizar appData
            document.appData.encodedDiagram = encodedDiagram;
            document.appData.numberOfDiagramPages = numberOfDiagramPages;
            document.appData.index = index;
            
            sendMessage({
              sender,
              data: { encodedDiagram, numberOfDiagramPages, index },
              synchronize: true,
            });
          } catch (error) {
            console.error('❌ Error encoding diagram:', error);
          }
        }
        const updatePlantumlLanguageMarkers = (function() {
          return function() {
            const model = document.editor.getModel();
            plantumlFeatures = plantumlFeatures || new PlantUmlLanguageFeatures();
            plantumlFeatures.validateCode(model)
              .then(markers => monaco.editor.setModelMarkers(model, "plantuml", markers));
          }
        })();
        if (sender && broadcastChanges) broadcastCodeEditorChanges();
        updatePlantumlLanguageMarkers();
      }
      function getInitPlantumlCodeAndRemoveElement() {
        const initCodeEl = document.getElementById("initCode");
        const initCode = initCodeEl.value;
        initCodeEl.remove();
        return initCode;
      }
      // create editor model
      const model = monaco.editor.createModel(
        getInitPlantumlCodeAndRemoveElement(),
        "apex",
        monaco.Uri.parse("inmemory://plantuml")
      );
      // create editor model watcher
      let timer = 0;
      model.onDidChangeContent(() => {

        //Consolelog de debug, borrar despues
        const currentContent = model.getValue();
        const currentURL = document.getElementById("url").value
        console.log("Texto ingresado:", currentContent);
        console.log("URL actual: ", currentURL );

        // Actualizar archivo en Google Drive si hay uno seleccionado
        if (typeof actualizarArchivoSeleccionado === 'function' && window.selectedFileId) {
          // Usar un timer separado para no interferir con el refresh del diagrama
          clearTimeout(window.driveUpdateTimer);
          window.driveUpdateTimer = setTimeout(() => {
            // Guardar el contenido del campo URL (codigo sin codificar)
            actualizarArchivoSeleccionado(currentContent)
              .then(() => console.log('Archivo actualizado en Google Drive con URL:', currentURL))
              .catch(err => console.error('Error actualizando en Drive:', err));
          }, 2000); // Esperar 2 segundos de inactividad antes de guardar
        }

        //
        clearTimeout(timer);
        document.appConfig.autoRefreshState = "waiting";
        timer = setTimeout(
          () => onPlantumlEditorContentChanged(model.getValue(), "editor"),
          document.appConfig.editorWatcherTimeout
        );
      });
      return model;
    }
    function getDefaultStorageService() {
      // create own storage service to expand suggestion documentation by default
      return {
        get() {},
        getBoolean(key) { return key === "expandSuggestionDocs"; },
        getNumber() { return 0; },
        remove() {},
        store() {},
        onWillSaveState() {},
        onDidChangeStorage() {},
        onDidChangeValue() {},
      };
    }

    // load monaco editor requirements
    await loadMonacoCodeEditorAsync();
    if (view !== "previewer") {
      // create editor
      const model = createEditorModel();
      const storageService = getDefaultStorageService();
      document.editor = monaco.editor.create(document.getElementById("monaco-editor"), {
        model, ...document.appConfig.editorCreateOptions
      }, { storageService });
      // sometimes the monaco editor has resize problems
      document.addEventListener("resize", () => document.editor.layout());
      // init editor components
      initEditorUrlInput();
      initEditorMenu();
    }
  }

  return { setEditorValue, initEditor };
})();

// Esperar a que el DOM esté completamente cargado antes de agregar el event listener
document.addEventListener('DOMContentLoaded', () => {
  const botonPDF = document.querySelector("#pdfButton");
  
  if (botonPDF) {
    botonPDF.addEventListener('click', async () => {
      const diagramImg = document.querySelector('#diagram-png');
      if (diagramImg && diagramImg.src && diagramImg.src.trim() !== "") {
        const imgPath = diagramImg.src;
        await downloadImageAsPDF(imgPath, "diagrama.pdf");
      } else {
        alert("No se encontró la imagen del diagrama o la ruta está vacía.");
      }
    });
    console.log('✅ Event listener del botón PDF agregado correctamente');
  } else {
    console.error('❌ No se encontró el elemento #pdfButton');
  }
});

async function downloadImageAsPDF(imgSrc, filename = 'imagen.pdf') {
  // Verificar que jsPDF esté disponible
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('Error: La librería jsPDF no está cargada. Por favor recarga la página.');
    return;
  }
  
  const { jsPDF } = window.jspdf;

  // 2) Cargar imagen (maneja CORS si el servidor lo permite)
  const img = new Image();
  img.crossOrigin = 'anonymous';
  const loaded = new Promise((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('No se pudo cargar la imagen (CORS o ruta inválida).'));
  });
  img.src = imgSrc;
  await loaded;

  // 3) Pasar a PNG (canvas) para insertarlo en el PDF
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const pngDataUrl = canvas.toDataURL('image/png');

  // 4) Crear PDF con el tamaño exacto de la imagen (sin márgenes ni escalado)
  // Convertir píxeles a puntos (1 píxel ≈ 0.75 puntos)
  const imgWidthInPoints = img.naturalWidth * 0.75;
  const imgHeightInPoints = img.naturalHeight * 0.75;
  
  // Crear PDF con tamaño personalizado (exactamente el tamaño de la imagen)
  const pdf = new jsPDF({ 
    orientation: imgWidthInPoints > imgHeightInPoints ? 'landscape' : 'portrait',
    unit: 'pt', 
    format: [imgWidthInPoints, imgHeightInPoints]
  });
  
  // Agregar la imagen sin escalar, ocupando toda la página
  pdf.addImage(pngDataUrl, 'PNG', 0, 0, imgWidthInPoints, imgHeightInPoints);
  pdf.save(filename);
}