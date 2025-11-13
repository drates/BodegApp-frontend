import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_BASE_URL } from './utils/config';
import { authFetch } from './utils/authFetch';

const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;
const ME_ENDPOINT = `${API_BASE_URL}/api/auth/me`;

type UserRole = 'Admin' | 'User' | 'SuperAdmin' | 'Guest';

interface UserInfo {
  userId: string;
  email: string;
  role: UserRole;
  warehouseId: string;
  companyName?: string;
}

interface AuthContextType {
  token: string | null;
  userRole: UserRole;
  userInfo: UserInfo | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUserInfo: () => Promise<void>;
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<UserRole>('Guest');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!token;
  const isSuperAdmin = userRole === 'SuperAdmin';
  const isAdmin = userRole === 'Admin' || userRole === 'SuperAdmin';

  const decodeToken = (token: string): UserRole | null => {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadDecoded);
      return payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    } catch {
      return null;
    }
  };

  const fetchUserInfo = async () => {
    if (!token) return;

    try {
      const response = await authFetch('/api/auth/me');
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Error al obtener info del usuario:', error);
      logout();
    }
  };

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
        throw new Error(errorData.message || 'Credenciales inválidas.');
      }

      const data = await response.json();
      const newToken = data.token;
      const role = decodeToken(newToken);

      if (!role) throw new Error('Token inválido.');

      setToken(newToken);
      setUserRole(role as UserRole);
      localStorage.setItem('token', newToken);
      await fetchUserInfo();
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUserRole('Guest');
    setUserInfo(null);
    localStorage.removeItem('token');
  };

  useEffect(() => {
    if (token) {
      const role = decodeToken(token);
      if (role) {
        setUserRole(role as UserRole);
        fetchUserInfo();
      } else {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const value: AuthContextType = {
    token,
    userRole,
    userInfo,
    loading,
    login,
    logout,
    fetchUserInfo,
    isLoggedIn,
    isSuperAdmin,
    isAdmin
  };

  if (loading) return <div>Cargando sesión...</div>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};
