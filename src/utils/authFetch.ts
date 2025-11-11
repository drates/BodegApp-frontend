/**
 * Función wrapper para hacer fetch con el token de autenticación.
 * * NOTA: Esta función usa rutas relativas (ej: '/items/123') para que Azure Static Web Apps
 * pueda encaminar la solicitud correctamente a la API de backend.
 * * @param endpoint Ruta relativa de la API (ej: '/items/123', '/ingreso'). NO debe incluir la URL base.
 * @param options Opciones estándar de fetch.
 * @returns Promesa que resuelve en el objeto Response de fetch.
 */
export const authFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    
    // ✅ Se elimina la importación de 'useAuth' (TS6133) y la dependencia de 'config' (TS2307).
    
    const token = localStorage.getItem('token');
    
    // Aseguramos que la URL sea el endpoint relativo para el proxy de SWA
    const url = endpoint.startsWith('http') ? endpoint : endpoint; 

    const defaultHeaders = {
        'Content-Type': 'application/json',
        // Si hay token, lo adjuntamos
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const finalOptions: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers // Permite sobrescribir headers
        },
    };
    
    // Si la llamada falla por 401 (Unauthorized), se manejará en el componente que llame a authFetch
    const response = await fetch(url, finalOptions);

    return response;
};