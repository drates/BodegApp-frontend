import { API_BASE_URL } from './config';

/**
 * Función wrapper para hacer fetch con el token de autenticación.
 * @param endpoint Ruta relativa de la API (ej: '/items/123', '/auth/login')
 * @param options Opciones estándar de fetch
 * @returns Promesa que resuelve en el objeto Response de fetch
 */
export const authFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('token');

    // Construimos la URL final (absoluta si no empieza con http)
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    // DEBUG: Mostrar la URL y método
    console.log(`[authFetch] → ${options.method || 'GET'} ${url}`);

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const finalOptions: RequestInit = {
        ...options,
        headers: {
            ...options.headers,
            ...defaultHeaders
        }
    };

    try {
        const response = await fetch(url, finalOptions);

        // DEBUG: Mostrar código de estado
        console.log(`[authFetch] ← ${response.status} ${response.statusText}`);

        return response;
    } catch (error) {
        // DEBUG: Mostrar error de red
        console.error(`[authFetch][ERROR] Fallo de red al llamar a ${url}:`, error);
        throw new Error('Error de red. Verifica tu conexión o intenta más tarde.');
    }
};
