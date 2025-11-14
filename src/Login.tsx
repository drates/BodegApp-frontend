import AuthPanel from './AuthPanel';

function Login() {
  return (
    <div style={{ padding: '0.2rem', marginTop: '20px' }}>
      {/* Header fijo */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#0077cc',
        color: '#fff',
        padding: '0.5rem 0.3rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img 
      src="/logo.svg" 
      alt="Logo BodegaFeliz"
      style={{ width: '25px', height: '25px', verticalAlign: 'middle' }}
    />
    <h1 style={{ margin: 0, fontSize: '1.15rem', lineHeight: '1' }}>BodegaFeliz</h1>
  </div>
        <p style={{ margin: 0, fontSize: '.8rem', opacity: 0.9 }}>
          Inventario simple y eficiente
        </p>
      </div>

      {/* Panel de autenticación */}
      <div style={{ 
            marginTop: '10px',
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