import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ====================================================================
// 💡 CORRECCIÓN CRÍTICA: Centralizar la URL de la API (para login/register)
// Esto resuelve el error TS2307 (Cannot find module './config')
// ====================================================================
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; 
const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`; 

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
        const payload = JSON.parse(payloadDecoded);
        // El rol se almacena en la claim 'role' o 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        return payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    } catch (e) {
        return null;
    }
};

type UserRole = 'Admin' | 'User' | 'SuperAdmin' | 'Guest';

interface AuthContextType {
    token: string | null;
    userRole: UserRole;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    // ✅ PROPIEDADES AÑADIDAS para resolver los errores TS2339 en App.tsx y SuperAdminPanel.tsx
    isLoggedIn: boolean; 
    isSuperAdmin: boolean;
    isAdmin: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode; 
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [userRole, setUserRole] = useState<UserRole>('Guest');
    const [loading, setLoading] = useState(true); 

    // Propiedades calculadas (necesarias para App.tsx y SuperAdminPanel.tsx)
    const isLoggedIn = !!token;
    const isSuperAdmin = userRole === 'SuperAdmin';
    const isAdmin = userRole === 'Admin' || userRole === 'SuperAdmin'; 

    useEffect(() => {
        if (token) {
            const role = decodeToken(token);
            if (role) {
                setUserRole(role as UserRole);
                localStorage.setItem('token', token); 
            } else {
                setToken(null);
                localStorage.removeItem('token');
                setUserRole('Guest');
            }
        }
        setLoading(false);
    }, [token]);


    const login = async (email: string, password: string) => {
        setLoading(true);

        try {
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

            setToken(newToken);
            setUserRole(role as UserRole);
            
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

    const value = {
        token,
        userRole,
        loading,
        login,
        logout,
        // ✅ Exportamos las propiedades calculadas
        isLoggedIn, 
        isSuperAdmin,
        isAdmin
    };

    if (loading) {
        return <div>Cargando sesión...</div>; 
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};