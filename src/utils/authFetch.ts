import { API_BASE_URL } from './config';

/**
 * Función wrapper para hacer fetch con el token de autenticación.
 * @param endpoint Ruta relativa de la API (ej: '/items/123', '/auth/login') o absoluta ('http://...')
 * @param options Opciones estándar de fetch
 * @returns Promesa que resuelve en el objeto Response de fetch
 */
export const authFetch = async (endpoint: string, options: RequestInit = {}, skipAuthCheck: boolean = false): Promise<Response> => {
    const token = localStorage.getItem('token');

    // Normaliza la base para evitar doble slash
    const normalizedBase = API_BASE_URL.endsWith('/')
        ? API_BASE_URL.slice(0, -1)
        : API_BASE_URL;

    const normalizedEndpoint = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;

    const url = endpoint.startsWith('http')
        ? endpoint
        : `${normalizedBase}${normalizedEndpoint}`;

    console.log(`[authFetch] → ${options.method || 'GET'} ${url}`);

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const finalOptions: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, finalOptions);

        console.log(`[authFetch] ← ${response.status} ${response.statusText}`);

        if (!skipAuthCheck && response.status === 401) {
            console.warn('[authFetch] Token inválido. Redirigiendo al login...');
            localStorage.removeItem('token');
            //window.location.href = '/';
            throw new Error('Sesión expirada');
        }

        return response;
    } catch (error) {
        console.error(`[authFetch][ERROR] Fallo de red al llamar a ${url}:`, error);
        throw new Error('Error de red. Verifica tu conexión o intenta más tarde.');
    }
};
