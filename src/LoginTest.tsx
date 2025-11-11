import { useState } from 'react';
import AuthPanel from './AuthPanel';
import ItemForm from './ItemForm';
import ItemEgresoForm from './ItemEgresoForm';
import ItemList from './ItemList';
import StockAlert from './StockAlert';
import HistorialMovimientos from './HistorialMovimientos';
import { authFetch } from './utils/authFetch';

function LoginTest() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  const handleShowUser = async () => {
    try {
      const res = await authFetch('http://localhost:5000/auth/me');
      const data = await res.json();
      setUserInfo(data);
    } catch (err) {
      console.error('Error al obtener datos del usuario:', err);
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem('token');
    alert('Token eliminado manualmente');
  };

  return (
    <div style={{ padding: '2rem', marginTop: '120px' }}>
      {!isLoggedIn ? (
        <AuthPanel onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={handleShowUser} style={{ marginRight: '1rem' }}>
              Mostrar datos del usuario
            </button>
            <button onClick={handleLogout} style={{ marginRight: '1rem' }}>
              Logout (simulado)
            </button>
            <button onClick={handleClearToken}>
              Eliminar token manualmente
            </button>
          </div>

          {userInfo && (
            <div style={{ marginBottom: '1rem', background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
              <strong>Usuario autenticado:</strong>
              <pre>{JSON.stringify(userInfo, null, 2)}</pre>
            </div>
          )}

          <ItemForm onItemCreated={() => {}} />
          <ItemEgresoForm onItemUpdated={() => {}} />
          <StockAlert />
          <ItemList />
          <HistorialMovimientos />
        </>
      )}
    </div>
  );
}

export default LoginTest;
