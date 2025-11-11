import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// URL de tu API de autenticación. ¡Asegúrate de que esta URL sea correcta!
const AUTH_API_URL = "http://localhost:5000/auth/login"; 

// ====================================================================
// UTILIDADES
// ====================================================================

/**
 * Decodifica un JWT para extraer el payload y buscar la claim de rol.
 * Busca las claims de rol comunes en tokens de .NET/C#.
 */
const decodeToken = (token: string): string | null => {
    try {
        const payloadBase64 = token.split('.')[1];
        // Reemplazo para tokens Base64 URL Safe
        const payloadDecoded = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const decoded = JSON.parse(payloadDecoded);
        
        // La clave de rol puede variar. Buscamos las más probables.
        const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                     decoded.role || 
                     decoded.Role;
        
        return typeof role === 'string' ? role : null;
    } catch (e) {
        console.error("Fallo al decodificar token o extraer el rol:", e);
        return null;
    }
};


// ====================================================================
// CONTEXTO DE AUTENTICACIÓN
// ====================================================================

// 1. Define el tipo de contexto
type AuthContextType = {
    token: string | null;
    userRole: string; // 'Superadmin', 'User', o 'Guest'
    isLoggedIn: boolean;
    isSuperAdmin: boolean;
    loading: boolean; // Indica si se está verificando el token o iniciando sesión (CLAVE para el bug)
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const defaultContext: AuthContextType = {
    token: null,
    userRole: 'Guest',
    isLoggedIn: false,
    isSuperAdmin: false,
    loading: false, 
    login: () => Promise.reject(new Error('Login function not initialized')), 
    logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

// 2. Define el Provider
type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Lee los valores iniciales de localStorage
    const initialToken = localStorage.getItem('token');
    const initialRole = localStorage.getItem('userRole') || 'Guest';

    const [token, setToken] = useState<string | null>(initialToken);
    const [userRole, setUserRole] = useState<string>(initialRole);
    // 🛑 CLAVE: loading debe ser true solo para la primera comprobación del token.
    const [loading, setLoading] = useState<boolean>(true); 
    
    // Calcula estados derivados
    const isLoggedIn = !!token;
    const isSuperAdmin = userRole === 'Superadmin';

    // --- EFECTOS ---

    // 1. Efecto para manejar la persistencia en localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', userRole);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
        }
    }, [token, userRole]);

    // 2. ✅ CORRECCIÓN PRINCIPAL: Lógica de verificación inicial del token
    useEffect(() => {
        const verifyInitialToken = () => {
            // Si hay token guardado pero el rol es genérico, intenta decodificarlo.
            if (initialToken && initialRole === 'Guest') {
                 const role = decodeToken(initialToken);
                 if (role) {
                     // Solo actualiza el rol si se decodifica correctamente
                     setUserRole(role);
                 } else {
                     // Si el token es inválido o expirado, lo limpiamos.
                     setToken(null);
                     setUserRole('Guest');
                 }
            }
            // 🛑 Esto debe ejecutarse SIEMPRE para indicar que la fase de inicialización ha terminado
            setLoading(false); 
        };

        // Si el token ya se leyó y el rol es Superadmin (refresco), no hacemos nada
        if (initialToken && initialRole !== 'Guest') {
            setLoading(false); 
            return;
        }

        // Ejecutamos la verificación
        verifyInitialToken();
        
    }, []); // 🛑 CLAVE: Se ejecuta solo una vez al montar el componente

    // --- FUNCIONES DE ACCIÓN ---

    /**
     * Inicia sesión llamando a la API, guarda el token y extrae el rol.
     */
    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await fetch(AUTH_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Credenciales inválidas o error de red.');
            }

            const data = await response.json();
            const newToken = data.token;
            
            const role = decodeToken(newToken);
            
            if (!role) {
                throw new Error("El token de sesión no contiene un rol válido.");
            }

            // Éxito: Actualizar el estado
            setToken(newToken);
            setUserRole(role);
            
        } catch (error: any) {
            throw error; 
        } finally {
            setLoading(false); // 🛑 CLAVE: SetLoading(false) se ejecuta al final de login/error
        }
    };


    const logout = () => {
        setLoading(true); // Opcional: mostrar spinner al desloguearse
        setToken(null);
        setUserRole('Guest');
        setLoading(false);
    };

    // --- CONTEXT VALUE ---
    const value: AuthContextType = {
        token,
        userRole,
        isLoggedIn,
        isSuperAdmin,
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Define el Hook de Consumo
export const useAuth = () => {
    return useContext(AuthContext);
};