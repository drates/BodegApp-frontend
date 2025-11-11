// utils/authFetch.ts

import { API_BASE_URL } from '../config'; // Importamos la URL base

/**
 * Función helper para realizar llamadas a la API con el token de autenticación.
 * * @param url La URL o path del endpoint (ej: '/items' o 'http://dominio/items').
 * @param options Opciones estándar de la llamada fetch.
 * @returns El objeto Response de la llamada.
 */
export async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    // 🌟 NUEVA LÓGICA: Construir la URL absoluta
    let fullUrl = url;
    // Chequeamos si la URL ya es absoluta (contiene ://)
    if (!url.includes('://')) {
        // Si es relativa, la combinamos con la base
        fullUrl = `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    const headers = {
        // Aseguramos que si no se provee Content-Type, sea JSON por defecto
        "Content-Type": "application/json", 
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
    };

    // 1. Ejecutar el fetch con el token
    const res = await fetch(fullUrl, { ...options, headers }); // Usamos fullUrl

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

    // 3. 🌟 CORRECCIÓN CRÍTICA: No intentar leer JSON si el cuerpo está vacío (ej. PUT/DELETE 204 No Content)
    // Devolvemos el objeto Response directamente. El llamador decide si llama a .json()
    return res;
}