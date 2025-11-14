import React, { useState } from 'react';
import { authFetch } from './utils/authFetch';
import Spinner from './Spinner';

const REGISTER_ENDPOINT = '/api/auth/register';

function AuthPanel() {
  const login = async (email: string, password: string) => {
    const res = await authFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Credenciales inválidas');
    }

    const { token } = await res.json();
    localStorage.setItem('token', token);
    window.location.href = '/home';
  };

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('');
  const [otroNegocio, setOtroNegocio] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isLoginMode) {
      if (!nombreEmpresa || !tipoNegocio || (tipoNegocio === 'Otro' && !otroNegocio)) {
        setError('Por favor, complete todos los campos de registro.');
        setIsLoading(false);
        return;
      }

      const registrationData = {
        email,
        password,
        companyName: nombreEmpresa,
        businessType: tipoNegocio === 'Otro' ? otroNegocio : tipoNegocio,
      };

      try {
        const response = await authFetch(REGISTER_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registrationData),
        });

        if (response.ok) {
          setError('✅ Registro exitoso. Iniciando sesión...');
          await login(email, password);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error desconocido durante el registro.');
        }
      } catch (err: any) {
        setError(err.message || 'Hubo un error al registrar la cuenta.');
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        await login(email, password);
      } catch (err: any) {
        setError(err.message || 'Error de inicio de sesión. Verifique sus credenciales.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const businessTypes = ['Retail', 'Distribución', 'Manufactura', 'Servicios', 'Otro'];

  const inputStyle: React.CSSProperties = {
    padding: '10px',
    border: '1px solid #e9e6e6ff',
    borderRadius: '8px',
    boxSizing: 'border-box',
    marginBottom: '10px',
    width: '100%',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  };

  const submitButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: isLoginMode ? '#007bff' : '#28a745',
    color: 'white',
    width: '100%',
    marginBottom: '10px',
  };

  const switchButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    fontSize: '13px',
    color: '#6c757d',
    border: '1px solid #6c757d',
    width: '100%',
    marginTop: '10px',
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#ffffffff',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#343a40' }}>
          {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>

        {isLoading && (
          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <Spinner />
          </div>
        )}

        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
          disabled={isLoading}
        />

        {!isLoginMode && (
          <>
            <input
              type="text"
              placeholder="Nombre de la Empresa"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              required
              style={inputStyle}
              disabled={isLoading}
            />
            <select
              value={tipoNegocio}
              onChange={(e) => {
                setTipoNegocio(e.target.value);
                if (e.target.value !== 'Otro') setOtroNegocio('');
              }}
              required
              style={inputStyle}
              disabled={isLoading}
            >
              <option value="">Seleccione Tipo de Negocio</option>
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {tipoNegocio === 'Otro' && (
              <input
                type="text"
                placeholder="Especifique otro tipo de negocio"
                value={otroNegocio}
                onChange={(e) => setOtroNegocio(e.target.value)}
                required
                style={inputStyle}
                disabled={isLoading}
              />
            )}
          </>
        )}

        <button type="submit" style={submitButtonStyle} disabled={isLoading}>
          {isLoading ? 'Cargando...' : isLoginMode ? 'Iniciar Sesión' : 'Crear cuenta'}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setError('');
          }}
          style={switchButtonStyle}
          disabled={isLoading}
        >
          {isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>

        {error && (
          <p
            style={{
              color: error.includes('exitoso') ? '#28a745' : '#dc3545',
              textAlign: 'center',
              marginTop: '10px',
              fontWeight: 'bold',
            }}
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default AuthPanel;
