import { useEffect, useState } from 'react';
//import Login from './Login';
import Home from './Home';
import SuperAdminPanel from './SuperAdminPanel';
import Spinner from './Spinner';
import { authFetch } from './utils/authFetch';
// 💡 IMPORTAR EL NUEVO COMPONENTE LANDING
import Landing from './Landing'; 

function App() {
  const [loading, setLoading] = useState(true);
type UserInfo = {
  email: string;
  role: string;
  companyName: string;
};

const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authFetch('/api/auth/me');
        // NOTA: Si la sesión expira (401), authFetch internamente
        // remueve el token y lanza un error.
        if (!res.ok) throw new Error('401'); 
        const data = await res.json();
        setUserInfo(data);
      } catch {
        localStorage.removeItem('token');
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Spinner />
        <p>Cargando sesión...</p>
      </div>
    );
  }

  // 🚨 CAMBIO CLAVE: Si no hay usuario, redirigir a Landing.tsx
  if (!userInfo) return <Landing />;
  
  // NOTA: Asegúrate de que el rol 'Superadmin' en TypeScript
  // coincida con el casing en tu backend ('Superadmin' vs 'SuperAdmin').
  // En tu código actual dice 'SuperAdmin', lo mantengo.
if (userInfo.role.toLowerCase() === 'superadmin') {
      return <SuperAdminPanel userInfo={userInfo} />;
  }
    
  return <Home userInfo={userInfo} />;
}

export default App;