import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ====================================================================
// 💡 CORRECCIÓN CRÍTICA: Centralizar la URL de la API (para login/register)
// ====================================================================
// Lee VITE_API_URL configurada en Azure SWA o usa el fallback de localhost:5000.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; 
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`; 

// El endpoint de registro también debe usar la base
// Nota: Si el registro se maneja aquí, ajusta. Si se maneja en AuthPanel.tsx (como tu código original), no es necesario.
// Si se maneja en el mismo componente de Login/Register:
// const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`; 
// ====================================================================


// ====================================================================
// UTILIDADES (El resto de la lógica de decodificación de token no cambia)
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
// CONTEXTO DE AUTENTICACIÓN (Types, Context, Hook - No se muestran por brevedad)
// ====================================================================
// ... (Toda la definición de types y el contexto)

// ====================================================================
// PROVIDER
// ====================================================================
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [userRole, setUserRole] = useState<string>('Guest');
    const [loading, setLoading] = useState(true);

    // ... (useEffect para validar el token - no se muestra por brevedad)

    const isLoggedIn = !!token;
    const isSuperAdmin = userRole === 'Superadmin';


    const login = async (email: string, password: string): Promise<void> => {
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
            setLoading(false);
        }
    };


    const logout = () => {
        setLoading(true); 
        setToken(null);
        setUserRole('Guest');
        localStorage.removeItem('token'); // Asegurarse de removerlo aquí
        setLoading(false);
    };

    // ... (Valor del contexto y Provider - no se muestran por brevedad)

    // return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    // ...
};