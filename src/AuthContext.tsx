import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from './config'; // 💡 Importamos la URL base centralizada

// ====================================================================\
// 💡 CORRECCIÓN CRÍTICA: Centralizar la URL de la API (para login/register)
// ====================================================================\
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`; 
const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`; // Usado en AuthPanel.tsx, pero bueno definirlo aquí o en un config si queremos coherencia.
// ====================================================================\


// ====================================================================\
// UTILIDADES
// ====================================================================\

/**
 * Decodifica un JWT para extraer el payload y buscar la claim de rol.
 * Busca las claims de rol comunes en tokens de .NET/C# o custom claims.
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
        
        // Devolvemos el rol como string o null si no se encuentra
        return typeof role === 'string' ? role : null;
    } catch (e) {
        console.error("Fallo al decodificar token o extraer el rol:", e);
        return null;
    }
};


// ====================================================================\
// CONTEXTO DE AUTENTICACIÓN
// ====================================================================\

// 📦 Definición de Tipos
type AuthContextType = {
    token: string | null;
    userRole: string;
    isLoggedIn: boolean;
    isSuperAdmin: boolean;
    loading: boolean; // Estado de carga inicial (verificación de token)
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

// Valor por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// 🧑‍💻 Componente Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [userRole, setUserRole] = useState('Guest');
    const [loading, setLoading] = useState(true); // Inicialmente TRUE

    // Estados derivados
    const isLoggedIn = !!token;
    const isSuperAdmin = userRole === 'SuperAdmin';
    
    // 🔄 Efecto para la carga inicial / chequeo de token en localStorage
    useEffect(() => {
        // Si hay un token, intentar decodificarlo para establecer el rol
        if (token) {
            const role = decodeToken(token);
            if (role) {
                setUserRole(role);
            } else {
                // Token inválido o sin rol, forzar logout
                localStorage.removeItem('token');
                setToken(null);
                setUserRole('Guest');
            }
        }
        // Marcar la carga como completada después del chequeo
        setLoading(false); 
        // El effect solo se ejecuta al montar o si el token cambia (setToken)
    }, [token]); 


    // 🔒 Función de Login
    const login = async (email: string, password: string) => {
        setLoading(true);

        try {
            // 💡 Uso de la constante que lee la variable de entorno
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
            
            // 🚨 Guardar el nuevo token en localStorage inmediatamente
            localStorage.setItem('token', newToken);

            const role = decodeToken(newToken);
            
            if (!role) {
                // Si no hay rol, consideramos el login fallido.
                localStorage.removeItem('token'); // Limpiar token
                throw new Error("El token de sesión no contiene un rol válido.");
            }

            // Éxito: Actualizar el estado
            setToken(newToken); // Esto dispara el useEffect para revalidar
            setUserRole(role);
            
        } catch (error: any) {
            // Importante: Volver a lanzar el error para que el componente Login/AuthPanel lo maneje
            throw error; 
        } finally {
            // El setLoading(false) se maneja implícitamente por el setToken en el effect,
            // pero lo ponemos aquí para asegurar que el estado de carga se actualice
            // después de un error de login.
            setLoading(false); 
        }
    };


    const logout = () => {
        setLoading(true); 
        setToken(null);
        setUserRole('Guest');
        localStorage.removeItem('token'); // Asegurarse de removerlo aquí
        // Forzar la navegación a la raíz para que AppRouter muestre Login
        window.location.href = '/'; 
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