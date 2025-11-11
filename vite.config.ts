// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // INICIO: CONFIGURACIÓN DEL PROXY
  server: {
    proxy: {
      // Si el frontend llama a una ruta que empieza por '/api'
      '/api': {
        // Redirige la petición a la URL de tu Backend
        target: 'http://localhost:5000/items', 
        // Es necesario para que el Backend sepa que la petición viene de un host diferente
        changeOrigin: true, 
        // Opcional: Reemplaza '/api' con '' en la URL final (dependerá de la configuración de tu C#)
        // rewrite: (path) => path.replace(/^\/api/, ''), 
        // Desactiva la verificación SSL (necesario si estás usando HTTP)
        secure: false,
      },
    },
  },
  // FIN: CONFIGURACIÓN DEL PROXY
})