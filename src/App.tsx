import { useEffect, useState } from 'react';
import Login from './Login';
import Home from './Home';
import SuperAdminPanel from './SuperAdminPanel';
import Spinner from './Spinner';
import { authFetch } from './utils/authFetch';

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

  if (!userInfo) return <Login />;
  if (userInfo.role === 'SuperAdmin') return <SuperAdminPanel userInfo={userInfo} />;
  return <Home userInfo={userInfo} />;
}

export default App;
