// utils/authFetch.ts

export async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        // Aseguramos que si no se provee Content-Type, sea JSON por defecto
        "Content-Type": "application/json", 
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
    };

    // 1. Ejecutar el fetch con el token
    const res = await fetch(url, { ...options, headers });

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

    // 3. 🌟 CORRECCIÓN CLAVE: Devolvemos el objeto Response completo.
    // Esto soluciona el TypeError en StockAlert.tsx.
    return res;
}