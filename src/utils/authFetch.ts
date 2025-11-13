import { API_BASE_URL } from './config';

/**
 * Función wrapper para hacer fetch con el token de autenticación.
 * @param endpoint Ruta relativa de la API (ej: '/items/123', '/auth/login')
 * @param options Opciones estándar de fetch
 * @returns Promesa que resuelve en el objeto Response de fetch
 */
export const authFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('token');
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

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

        console.log(`[authFetch] ← ${response.status} ${response.statusText}`);

        // ✅ Manejo automático de sesión expirada
        if (response.status === 401) {
            console.warn('[authFetch] Token inválido. Redirigiendo al login...');
            localStorage.removeItem('token');
            window.location.href = '/';
            throw new Error('Sesión expirada');
        }

        return response;
    } catch (error) {
        console.error(`[authFetch][ERROR] Fallo de red al llamar a ${url}:`, error);
        throw new Error('Error de red. Verifica tu conexión o intenta más tarde.');
    }
};
