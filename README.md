# AlvaritoUML

Frontend de PlantUML que utiliza el servidor oficial de PlantUML (https://www.plantuml.com/plantuml).

## Características

- ✅ Editor Monaco integrado con soporte completo para PlantUML
- ✅ Barra de URL para compartir diagramas
- ✅ Integración con Google Drive para guardar/cargar proyectos
- ✅ Vista previa en múltiples formatos: PNG, SVG, ASCII Art, PDF
- ✅ Exportación e importación de diagramas
- ✅ Temas claro/oscuro
- ✅ Configuración personalizable
- ✅ Interfaz idéntica a PlantUML Server

## Instalación

```bash
# Instalar dependencias
npm install

# O si usas pnpm
pnpm install
```

## Uso

### Desarrollo local

```bash
# Iniciar servidor de desarrollo (abre automáticamente el navegador)
npm run dev

# O iniciar servidor sin abrir navegador
npm start
```

El servidor se ejecutará en `http://localhost:8080`

### Producción

Para desplegar en producción (Render, Vercel, Netlify, etc.), simplemente sube los archivos al servidor.
La aplicación es 100% estática y no requiere backend propio, ya que usa el servidor oficial de PlantUML.

## Configuración de Google Drive

1. Copia el archivo `components/preview/menu/google-drive-config.example.js` a `google-drive-config.js`
2. Configura tus credenciales de Google Drive API
3. El archivo `google-drive-config.js` está en `.gitignore` para mantener tus credenciales seguras

Para variables de entorno en producción, puedes configurar:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_API_KEY`

## Arquitectura

```
alvaritoUML/
├── assets/           # Iconos SVG y recursos estáticos
├── components/       # Componentes de UI (editor, preview, modals)
├── js/              # Utilidades JavaScript
│   ├── communication/
│   ├── config/
│   ├── language/
│   ├── utilities/
│   └── plantuml-base.js  # Configuración del servidor oficial
├── min/             # Archivos minificados
├── index.html       # Punto de entrada
└── package.json     # Configuración npm
```

## Servidor PlantUML

Este frontend está configurado para usar el servidor oficial de PlantUML:
- URL: https://www.plantuml.com/plantuml
- Configurado en: `js/plantuml-base.js`

Si necesitas cambiar el servidor, modifica la función `getPlantumlBase()` en `plantuml-base.js`.

## Tecnologías

- HTML5 / CSS3 / JavaScript ES6
- Monaco Editor 0.36.1 (desde CDN)
- Google Drive API
- PlantUML Official Server

## Licencia

MIT License
