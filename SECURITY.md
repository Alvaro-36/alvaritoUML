# 🔒 Seguridad - Archivos de Configuración de Google Drive

## ✅ Archivos SEGUROS para subir a Git/Vercel:

Estos archivos **NO contienen credenciales** y son seguros para commit:

- `google-drive-config-loader.js` ✅
- `google-drive-config.example.js` ✅  
- `credentials.env.example` ✅
- `VERCEL_SETUP.md` ✅
- `.gitignore` ✅

## ❌ Archivos que NO DEBEN subirse a Git/Vercel:

Estos archivos **contienen credenciales reales** y están protegidos por `.gitignore`:

- `google-drive-config.js` ❌ (contiene CLIENT_ID y API_KEY reales)
- `credentials.env` ❌ (contiene CLIENT_ID y API_KEY reales)

## 📋 Verificación antes de commit:

Ejecuta este comando para verificar que los archivos con credenciales están ignorados:

```bash
git status
```

Deberías ver SOLO archivos seguros en la lista. Si ves `google-drive-config.js` o `credentials.env`, **NO hagas commit**.

## 🚀 Para deploy en Vercel:

1. Sube el código a GitHub (los archivos con credenciales quedarán en tu máquina local)
2. En Vercel, configura las variables de entorno:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_API_KEY`
3. Deploy automático desde GitHub

Ver `VERCEL_SETUP.md` para instrucciones detalladas.
