import React from 'react';
import AuthPanel from './AuthPanel';

function Login() {
  return (
    <div style={{ padding: '2rem', marginTop: '120px' }}>
      {/* Header fijo */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#0077cc',
        color: '#fff',
        padding: '1rem 0.3rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}>
        <h1>BodegApp</h1>
        <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>
          Inventario simple y eficiente - para todo tipo de negocios
        </p>
      </div>

      {/* Panel de autenticación */}
      <div style={{ 
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
        {/* AuthPanel ahora llama directamente a useAuth().login() */}
        <AuthPanel />
      </div>
    </div>
  );
}

export default Login;