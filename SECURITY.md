# 🔒 Seguridad - Archivos de Configuración de Google Drive

## ✅ Archivos SEGUROS para subir a Git/Vercel:

Estos archivos **SÍ contienen credenciales** pero son necesarios para producción:

- `google-drive-config.prod.js` ✅ (Configuración para Vercel/producción)
- `google-drive-config.example.js` ✅ (Plantilla con instrucciones)
- `credentials.env.example` ✅ (Plantilla de variables de entorno)
- `VERCEL_SETUP.md` ✅ (Instrucciones para deploy)
- `.gitignore` ✅ (Protege archivos sensibles)

## ❌ Archivos que NO DEBEN subirse a Git:

Estos archivos contienen tus credenciales **personales de desarrollo** y están protegidos por `.gitignore`:

- `google-drive-config.js` ❌ (Desarrollo local - tus credenciales personales)
- `credentials.env` ❌ (Variables de entorno locales)

## � ¿Por qué google-drive-config.prod.js se sube a Git?

Este archivo contiene las credenciales para **producción** y es seguro subirlo porque:
1. Las credenciales de Google Drive OAuth 2.0 **requieren configurar dominios autorizados**
2. En Google Cloud Console, solo autorizas tu dominio de producción (ej: `alvarito-uml.vercel.app`)
3. Aunque alguien vea las credenciales, **no puede usarlas desde otro dominio**
4. Es la práctica estándar para aplicaciones client-side que usan OAuth 2.0

## 📋 Configuración en Google Cloud Console:

Para proteger tus credenciales, configura en Google Cloud Console:

1. Ve a **Credenciales** → **OAuth 2.0 Client ID**
2. En **Orígenes autorizados de JavaScript**, agrega SOLO:
   - `http://localhost:8080` (desarrollo)
   - `https://alvarito-uml.vercel.app` (producción)
3. **NO agregues** `*` ni otros dominios

De esta forma, aunque las credenciales sean públicas, solo funcionarán en tus dominios.

## 🚀 Para desarrollo local:

Crea tu propio `google-drive-config.js` (no se subirá a Git):

```bash
cp components/preview/menu/google-drive-config.example.js components/preview/menu/google-drive-config.js
```

Luego edita el archivo y pon tus propias credenciales.

## 📊 Flujo de carga:

1. **Desarrollo local**: Carga `google-drive-config.js` (tus credenciales personales)
2. **Producción (Vercel)**: Si falla el anterior, carga `google-drive-config.prod.js`

