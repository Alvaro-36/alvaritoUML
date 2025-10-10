# AlvaritoUML

Frontend de PlantUML que utiliza el servidor oficial de PlantUML (https://www.plantuml.com/plantuml).

## Características

- ✅ Editor Monaco integrado con soporte completo para PlantUML
- ✅ Barra de URL para compartir diagramas
- ✅ Integración OPCIONAL con Google Drive para guardar/cargar proyectos
- ✅ Vista previa en múltiples formatos: PNG, SVG, ASCII Art, PDF
- ✅ Exportación e importación de diagramas
- ✅ Exportación a PDF con tamaño exacto del diagrama
- ✅ Temas claro/oscuro con toggle
- ✅ Configuración personalizable
- ✅ 100% estático - No requiere backend
- ✅ Usa el servidor oficial de PlantUML

## Instalación

```bash
# Instalar dependencias
npm install
```

## Uso

### Desarrollo local

```bash
# Iniciar servidor de desarrollo (abre automáticamente el navegador)
npm run dev
```

El servidor se ejecutará en `http://localhost:8080`

### Producción

#### Despliegue en Vercel (Recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Alvaro-36/alvaritoUML)

Ver [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas.

**Resumen rápido:**
1. Haz click en el botón de arriba
2. Conecta tu cuenta de GitHub
3. (Opcional) Configura variables de entorno para Google Drive:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_API_KEY`
4. ¡Despliega!

#### Otros servicios

La aplicación es 100% estática. Puedes desplegarla en:
- **Netlify**: Arrastra la carpeta al dashboard
- **GitHub Pages**: Sube los archivos a la rama `gh-pages`
- **Render**: Conecta el repo y selecciona "Static Site"

## Configuración de Google Drive (Opcional)

⚠️ **Google Drive es completamente OPCIONAL**. La app funciona perfectamente sin él.

### Para desarrollo local:

```bash
# 1. Copia el archivo de ejemplo
cp components/preview/menu/google-drive-config.example.js components/preview/menu/google-drive-config.js

# 2. Edita el archivo con tus credenciales
# (El archivo está en .gitignore y no se subirá al repo)
```

### Para producción (Vercel/Render):

Configura las variables de entorno en tu plataforma:
- `GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com`
- `GOOGLE_API_KEY=tu-api-key`

El script `build.sh` generará automáticamente el archivo de configuración durante el build.

Ver [DEPLOY.md](./DEPLOY.md) para obtener las credenciales de Google Cloud Console.

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
