import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; // ¡CLAVE para el build!
// ====================================================================
// 💡 CORRECCIÓN CRÍTICA: Centralizar la URL de la API (para login/register)
// Esto permite que la app funcione tanto en localhost como en Azure SWA.
// ====================================================================
// Lee VITE_API_URL configurada en Azure SWA o usa el fallback de localhost:5000.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; 
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`; 

// El endpoint de registro también debe usar la base.
// Lo definimos aquí si AuthPanel usa la lógica de fetch, o lo definimos allí.
// Asumiremos que AuthPanel.tsx lo define, pero es bueno tener una referencia.
// const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`; 
// ====================================================================


// ====================================================================
// UTILIDADES
// ====================================================================

/**
 * Decodifica un JWT para extraer el payload y buscar la claim de rol.
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
// CONTEXTO DE AUTENTICACIÓN (Types)
// ====================================================================
type AuthContextType = {
    token: string | null;
    userRole: string;
    isLoggedIn: boolean;
    isSuperAdmin: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

// 1. Creación del contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined); 

// ====================================================================
// PROVIDER
// ====================================================================
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [userRole, setUserRole] = useState<string>('Guest');
    const [loading, setLoading] = useState(true);

    // Lógica para validar token al iniciar la app o cuando el token cambia
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            const role = decodeToken(savedToken);
            if (role) {
                setToken(savedToken);
                setUserRole(role);
            } else {
                localStorage.removeItem("token");
                setToken(null);
            }
        }
        setLoading(false);
    }, []);

    // Valores derivados
    const isLoggedIn = !!token;
    const isSuperAdmin = userRole === 'Superadmin';


    const login = async (email: string, password: string): Promise<void> => {
        setLoading(true);

        try {
            // Uso de la constante que lee la variable de entorno
            const response = await fetch(LOGIN_ENDPOINT, { 
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
            localStorage.setItem('token', newToken); // Guardar el token aquí
            
        } catch (error: any) {
            throw error; 
        } finally {
            setLoading(false);
        }
    };


    const logout = () => {
        setLoading(true); 
        setToken(null);
        setUserRole('Guest');
        localStorage.removeItem('token'); 
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

    // 🛑 ARREGLO CRÍTICO: El Provider debe devolver el JSX
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 2. Hook para usar el contexto (¡CRÍTICO: Debe ser exportado!)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};