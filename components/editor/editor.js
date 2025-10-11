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
              diagramPreviewType: "svg",
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
            document.querySelector('#diagram-png').src = `https://img.plantuml.biz/plantuml/svg/${encodedDiagram}`

            //Actualizar los botones
            document.querySelector('#diagram-png').src = `https://img.plantuml.biz/plantuml/svg/${encodedDiagram}`
            
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


        const currentContent = model.getValue();
        const currentURL = document.getElementById("url").value
 

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

  // Helper: detectar si la fuente es SVG
  function isSvgSource(src) {
    if (!src) return false;
    const s = src.trim();
    return s.startsWith('<svg') || s.startsWith('data:image/svg+xml') || s.endsWith('.svg') || /\/svg(\?|$)/i.test(s);
  }

  // Factor de escala para rasterizar (aumenta la resolución del PNG resultante)
  const scaleFactor = Math.max(1, (window.devicePixelRatio || 1) * 2);

  // Si es SVG, intentamos rasterizarlo en alta resolución
  if (isSvgSource(imgSrc)) {
    try {
      let svgText = null;
      // 1) Obtener el texto SVG
      if (imgSrc.startsWith('data:image/svg+xml')) {
        // Data URI (puede estar URI encoded o base64)
        const comma = imgSrc.indexOf(',');
        const meta = imgSrc.substring(0, comma);
        const data = imgSrc.substring(comma + 1);
        if (/;base64/.test(meta)) {
          svgText = atob(data);
        } else {
          svgText = decodeURIComponent(data);
        }
      } else if (imgSrc.trim().startsWith('<svg')) {
        svgText = imgSrc;
      } else {
        // Remote URL: fetch the SVG text (puede fallar por CORS)
        const resp = await fetch(imgSrc);
        if (!resp.ok) throw new Error('Error al obtener SVG: ' + resp.status);
        svgText = await resp.text();
      }

      // 2) Extraer ancho/alto desde viewBox o atributos width/height
      let svgWidth = 800, svgHeight = 600;
      const viewBoxMatch = svgText.match(/viewBox\s*=\s*"([\d.\-\s]+)"/i);
      if (viewBoxMatch) {
        const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
        if (parts.length === 4) {
          svgWidth = parts[2];
          svgHeight = parts[3];
        }
      } else {
        const wMatch = svgText.match(/width\s*=\s*"([\d.]+)"/i);
        const hMatch = svgText.match(/height\s*=\s*"([\d.]+)"/i);
        if (wMatch) svgWidth = parseFloat(wMatch[1]);
        if (hMatch) svgHeight = parseFloat(hMatch[1]);
      }

      // Si siguen sin definirse, intentar detectar unidades en px dentro del contenido
      if (!svgWidth || !svgHeight) {
        const rectMatch = svgText.match(/<rect[^>]*width\s*=\s*"([\d.]+)"[^>]*height\s*=\s*"([\d.]+)"/i);
        if (rectMatch) {
          svgWidth = parseFloat(rectMatch[1]);
          svgHeight = parseFloat(rectMatch[2]);
        }
      }

      // 3) Preparar un SVG serializado que preserve la escala
      // Aseguramos que el SVG tenga atributos width/height en px y viewBox
      let svgForRender = svgText;
      if (!/viewBox\s*=/.test(svgForRender)) {
        svgForRender = svgForRender.replace(/<svg([^>]*)>/i, (m, attrs) => {
          return `<svg${attrs} viewBox=\"0 0 ${svgWidth} ${svgHeight}\">`;
        });
      }
      // Forzar width/height en px para evitar layouts responsivos
      if (!/\bwidth\s*=/.test(svgForRender)) {
        svgForRender = svgForRender.replace(/<svg([^>]*)>/i, (m, attrs) => `<svg${attrs} width=\"${svgWidth}px\" height=\"${svgHeight}px\">`);
      }

      // 4) Crear Image a partir del SVG y dibujar en canvas con escala
      const blob = new Blob([svgForRender], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const imgLoaded = new Promise((res, rej) => {
        img.onload = () => res();
        img.onerror = (e) => rej(new Error('No se pudo cargar el SVG como imagen (CORS o contenido inválido).'));
      });
      img.src = url;
      await imgLoaded;

      // Crear canvas con alta resolución
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(svgWidth * scaleFactor));
      canvas.height = Math.max(1, Math.round(svgHeight * scaleFactor));
      // Establecer tamaño CSS para que drawImage escale correctamente
      canvas.style.width = `${svgWidth}px`;
      canvas.style.height = `${svgHeight}px`;
      const ctx = canvas.getContext('2d');
      // Mejorar calidad al escalar
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const pngDataUrl = canvas.toDataURL('image/png');

      // 5) Crear PDF manteniendo el tamaño físico (puntos) correspondiente al tamaño SVG original
      const imgWidthInPoints = svgWidth * 0.75; // 1 px ≈ 0.75 pt
      const imgHeightInPoints = svgHeight * 0.75;
      const pdf = new jsPDF({
        orientation: imgWidthInPoints > imgHeightInPoints ? 'landscape' : 'portrait',
        unit: 'pt',
        format: [imgWidthInPoints, imgHeightInPoints]
      });
      pdf.addImage(pngDataUrl, 'PNG', 0, 0, imgWidthInPoints, imgHeightInPoints);
      pdf.save(filename);
      return;
    } catch (err) {
      console.warn('⚠️ Error al procesar SVG. Se intentará el flujo PNG como fallback:', err);
      // continuar al flujo PNG a continuación
    }
  }

  // Flujo para imágenes raster (PNG/JPEG) — ahora con factor de escala para mejorar calidad
  const img = new Image();
  img.crossOrigin = 'anonymous';
  const loaded = new Promise((res, rej) => {
    img.onload = () => res();
    img.onerror = (e) => rej(new Error('No se pudo cargar la imagen (CORS o ruta inválida).'));
  });
  img.src = imgSrc;
  await loaded;

  // Crear canvas con mayor resolución para mejorar calidad
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scaleFactor));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scaleFactor));
  canvas.style.width = `${img.naturalWidth}px`;
  canvas.style.height = `${img.naturalHeight}px`;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const pngDataUrl = canvas.toDataURL('image/png');

  // Convertir píxeles a puntos (1 píxel ≈ 0.75 puntos)
  const imgWidthInPoints = img.naturalWidth * 0.75;
  const imgHeightInPoints = img.naturalHeight * 0.75;
  const pdf = new jsPDF({ 
    orientation: imgWidthInPoints > imgHeightInPoints ? 'landscape' : 'portrait',
    unit: 'pt', 
    format: [imgWidthInPoints, imgHeightInPoints]
  });
  pdf.addImage(pngDataUrl, 'PNG', 0, 0, imgWidthInPoints, imgHeightInPoints);
  pdf.save(filename);
}