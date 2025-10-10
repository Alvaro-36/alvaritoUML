# 🚀 Despliegue en Vercel

## Pasos para desplegar

### 1. Preparación

1. **Fork o clona este repositorio** en tu cuenta de GitHub
2. Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub

### 2. Importar proyecto en Vercel

1. Click en **"Add New Project"**
2. Selecciona este repositorio (`alvaritoUML`)
3. Vercel detectará automáticamente la configuración

### 3. Configurar Variables de Entorno (Opcional - Solo para Google Drive)

Si quieres habilitar la integración con Google Drive:

#### 3.1 Obtener credenciales de Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Google Drive API**:
   - Ve a "APIs & Services" → "Enable APIs and Services"
   - Busca "Google Drive API" y habilítala
4. Crea credenciales:
   - Ve a "APIs & Services" → "Credentials"
   - Click en "Create Credentials" → "API Key" (guarda este valor)
   - Click en "Create Credentials" → "OAuth 2.0 Client ID"
     - Tipo: "Web application"
     - Authorized JavaScript origins: `https://tu-app.vercel.app`
     - Authorized redirect URIs: `https://tu-app.vercel.app`
   - Guarda el **Client ID**

#### 3.2 Configurar en Vercel

1. En la página de tu proyecto en Vercel, ve a **"Settings"** → **"Environment Variables"**
2. Agrega las siguientes variables:

```
GOOGLE_CLIENT_ID=tu-client-id-aqui.apps.googleusercontent.com
GOOGLE_API_KEY=tu-api-key-aqui
```

3. Click en **"Save"**

### 4. Desplegar

1. Click en **"Deploy"**
2. Espera a que termine el build (toma ~30 segundos)
3. ¡Tu app estará lista en `https://tu-proyecto.vercel.app`!

## ⚠️ Importante

- **Google Drive es OPCIONAL**: La aplicación funcionará perfectamente sin Google Drive
- Si NO configuras las variables de entorno, el botón de Google Drive simplemente no aparecerá
- Puedes desplegar SIN configurar Google Drive y agregarlo después

## 🔄 Actualizaciones

Cada vez que hagas `git push` a tu repositorio, Vercel automáticamente:
1. Ejecutará el script `build.sh`
2. Generará `google-drive-config.js` con tus credenciales (si están configuradas)
3. Desplegará la nueva versión

## 🧪 Desarrollo Local

Para desarrollo local, copia el archivo de ejemplo:

```bash
cp components/preview/menu/google-drive-config.example.js components/preview/menu/google-drive-config.js
```

Edita `google-drive-config.js` con tus credenciales locales.

**Nota**: Este archivo está en `.gitignore` y nunca se subirá al repositorio.
