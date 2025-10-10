# Configuración para Deploy en Vercel

Este proyecto requiere variables de entorno para la integración con Google Drive.

## Variables de entorno requeridas en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las siguientes variables:

```
GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
GOOGLE_API_KEY=tu_api_key_aqui
```

## Cómo obtener las credenciales:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita la API de Google Drive
4. Ve a "Credenciales" y crea:
   - **OAuth 2.0 Client ID** (para GOOGLE_CLIENT_ID)
   - **API Key** (para GOOGLE_API_KEY)

## Configurar OAuth en Google Cloud:

Para que funcione en Vercel, agrega estos dominios autorizados:
- `http://localhost:8080` (desarrollo)
- `https://tu-proyecto.vercel.app` (producción)

En Google Cloud Console → Credenciales → OAuth 2.0 Client ID:
- **Orígenes autorizados de JavaScript**: Agrega tu dominio de Vercel
- **URIs de redireccionamiento autorizados**: Agrega tu dominio de Vercel

## Deploy:

```bash
# Deploy a Vercel
vercel

# O conecta tu repo de GitHub y Vercel hará deploy automático
```

## Notas de seguridad:

- ✅ `google-drive-config.js` NO se sube a Git (está en .gitignore)
- ✅ `google-drive-config-loader.js` SÍ se sube (no contiene credenciales)
- ✅ Las credenciales solo existen en:
  - Tu máquina local (en google-drive-config.js)
  - Variables de entorno de Vercel (configuradas manualmente)
