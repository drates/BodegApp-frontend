// utils/authFetch.ts

// ====================================================================
// 💡 CORRECCIÓN CRÍTICA: Centralizar la URL de la API
// ====================================================================
// Lee VITE_API_URL configurada en Azure SWA o usa el fallback de localhost para desarrollo.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; 
// ====================================================================


export async function authFetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    // Construir la URL completa: API_BASE_URL + endpoint relativo
    const finalUrl = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    const headers = {
        // Aseguramos que si no se provee Content-Type, sea JSON por defecto
        "Content-Type": "application/json", 
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
    };

    // 1. Ejecutar el fetch con el token
    const res = await fetch(finalUrl, { ...options, headers }); // 💡 Uso de finalUrl

    // 2. Manejo de errores (Status 4xx o 5xx)
    if (!res.ok) {
        // Leemos el cuerpo DE LA RESPUESTA DE ERROR (como texto primero para no fallar)
        const errorText = await res.text();
        let errorMessage: string;

        try {
            // Intentamos parsear a JSON para obtener un mensaje estructurado
            const errorBody = JSON.parse(errorText);
            // Usamos el campo 'message' o 'error', o el cuerpo JSON completo
            errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
        } catch {
            // Si no fue JSON, usamos el texto plano
            errorMessage = errorText || `Error del servidor (Status ${res.status})`;
        }

        console.error("Error del servidor:", errorMessage);
        // Lanzamos un error con un mensaje limpio
        throw new Error(errorMessage);
    }

    // 3. Devolvemos el objeto Response (para que el componente decida si usar .json() o no)
    return res;
}