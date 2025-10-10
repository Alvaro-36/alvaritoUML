# Configuración para Deploy en Vercel

Este proyecto usa Google Drive OAuth 2.0 para guardar diagramas en la nube.

## ⚡ Deploy Rápido (Recomendado)

1. Haz push de tu código a GitHub
2. Conecta tu repositorio en Vercel
3. Deploy automático - ¡Listo! 🎉

**No necesitas configurar variables de entorno** porque las credenciales ya están en `google-drive-config.prod.js`.

## 🔒 Seguridad con OAuth 2.0

Las credenciales en `google-drive-config.prod.js` son seguras porque:

1. **OAuth 2.0 requiere dominios autorizados** en Google Cloud Console
2. Solo funcionan desde los dominios que tu configures
3. Es el método estándar para aplicaciones client-side

## ⚙️ Configuración en Google Cloud Console

Para que funcione en tu dominio de Vercel:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs y servicios** → **Credenciales**
4. Edita tu **OAuth 2.0 Client ID**
5. En **Orígenes autorizados de JavaScript**, agrega:
   - `http://localhost:8080` (desarrollo)
   - `https://tu-proyecto.vercel.app` (reemplaza con tu URL de Vercel)

## 🔑 Cómo obtener las credenciales (si necesitas crear nuevas):

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita la **Google Drive API**
4. Ve a **Credenciales** → **Crear credenciales**:
   - **OAuth 2.0 Client ID** (para CLIENT_ID)
   - **API Key** (para API_KEY)
5. Actualiza `google-drive-config.prod.js` con tus nuevas credenciales

## 📝 Variables de Entorno (Opcional - Método Alternativo)

Si prefieres usar variables de entorno en Vercel en lugar del archivo:

1. Ve a tu proyecto en Vercel → Settings → Environment Variables
2. Agrega:
   ```
   GOOGLE_CLIENT_ID=tu_client_id
   GOOGLE_API_KEY=tu_api_key
   ```
3. Modifica `google-drive-config.prod.js` para leer estas variables

## 🚀 Deploy:

```bash
# Deploy directo
vercel

# O simplemente push a GitHub y Vercel hará deploy automático
git push
```

## 📊 Diferencias Desarrollo vs Producción

- **Desarrollo**: Usa `google-drive-config.js` (no en Git, tus credenciales personales)
- **Producción**: Usa `google-drive-config.prod.js` (en Git, credenciales para producción)

## ✅ Checklist pre-deploy:

- [ ] Credenciales agregadas a `google-drive-config.prod.js`
- [ ] Dominio de Vercel agregado en Google Cloud Console
- [ ] Código pusheado a GitHub
- [ ] Proyecto conectado en Vercel
