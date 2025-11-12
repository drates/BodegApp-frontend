// vite.config.ts

import { defineConfig } from 'vite'
// Importación correcta para tu proyecto
import react from '@vitejs/plugin-react-swc' 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ==========================================================
  // 🎯 CONFIGURACIÓN CRÍTICA PARA AZURE STATIC WEB APPS (SWA)
  // ==========================================================
  // Fuerza a Vite a generar rutas de activos (assets) relativas a la raíz.
  // Esto es crucial para que Azure SWA encuentre el archivo main.js.
  base: '/', 
  
  build: {
    // Recomendado: Baja el target para máxima compatibilidad con el módulo script.
    target: 'es2015', 
    outDir: 'dist', // Directorio de salida por defecto
  },
  // ==========================================================
  
  // ==========================================================
  // ⚙️ CONFIGURACIÓN DE PROXY PARA DESARROLLO LOCAL (MANTENIDA)
  // ==========================================================
  server: {
    proxy: {
      // Si el frontend llama a una ruta que empieza por '/api'
      '/api': {
        // Redirige la petición a la URL de tu Backend
        target: 'http://localhost:5000/', 
        // Es necesario para que el Backend sepa que la petición viene de un host diferente
        changeOrigin: true, 
        // Desactiva la verificación SSL
        secure: false,
      },
    },
  },
  // ==========================================================
})