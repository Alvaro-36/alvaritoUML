#!/bin/bash
# Script de build para Vercel
# Este script genera google-drive-config.js desde variables de entorno

echo "🔧 Generando google-drive-config.js desde variables de entorno..."

# Verificar si las variables de entorno están configuradas
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_API_KEY" ]; then
  echo "⚠️  Variables de entorno no configuradas - Google Drive estará deshabilitado"
  echo "Para habilitar Google Drive, configura GOOGLE_CLIENT_ID y GOOGLE_API_KEY en Vercel"
  exit 0
fi

# Crear el archivo de configuración
cat > components/preview/menu/google-drive-config.js << EOF
/**
 * Configuración de Google Drive API
 * Este archivo fue generado automáticamente desde variables de entorno
 */

const GOOGLE_DRIVE_CONFIG = {
  CLIENT_ID: '${GOOGLE_CLIENT_ID}',
  API_KEY: '${GOOGLE_API_KEY}',
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  SCOPES: 'https://www.googleapis.com/auth/drive'
};
EOF

echo "✅ google-drive-config.js generado correctamente"
echo "   Client ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "   API Key: ${GOOGLE_API_KEY:0:10}..."
