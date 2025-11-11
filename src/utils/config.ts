// config.ts

/**
 * URL base de la API.
 * * Lee la variable de entorno VITE_API_BASE_URL (establecida en el entorno de host, 
 * por ejemplo, Azure Static Web Apps) o usa el fallback de localhost:5000 para desarrollo local.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Exportamos también la URL base para que otros archivos de configuración (como AuthContext)
// que ya usaban la lógica de lectura de env puedan simplificar.