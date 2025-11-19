import React, { useState } from 'react';
import { authFetch } from './utils/authFetch';
import Spinner from './Spinner';

const REGISTER_ENDPOINT = '/api/auth/register';

function AuthPanel() {
  const login = async (email: string, password: string) => {
    // 🛑 CAMBIO CRÍTICO: Añadimos 'true' al final para indicar a authFetch que omita el chequeo de 401
    const res = await authFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }, true); // <--- ¡Esto permite que el 401 pase al bloque if (!res.ok)!

    if (!res.ok) {
      // Bloque de manejo de errores robusto (mantenido)
      let errorMessage = 'Error desconocido al intentar hacer sesión.';
      
      try {
          // Intentamos leer el cuerpo de la respuesta como texto.
          const errorBody = await res.text();
          
          if (errorBody) {
              try {
                  // Si hay un cuerpo, intentamos parsearlo como JSON para buscar la clave 'message'
                  const errData = JSON.parse(errorBody);
                  // Usamos el mensaje del backend o el cuerpo completo si JSON falla
                  errorMessage = errData.message || errorBody;
              } catch {
                  // Si el parseo JSON falla (es texto plano o HTML), usamos el texto completo.
                  errorMessage = errorBody; 
              }
          } else {
              // Si no hay cuerpo, usamos el texto de estado HTTP (Ej: 401 Unauthorized)
              errorMessage = `Error ${res.status} (${res.statusText || 'Error del servidor'}).`;
          }
      } catch {
          // Fallo de lectura del stream de respuesta (muy raro)
          errorMessage = 'Fallo al procesar la respuesta del servidor.';
      }

      // Lanzamos el error capturado
      throw new Error(errorMessage);
    }

    // Código de éxito
    const { token } = await res.json();
    localStorage.setItem('token', token);
    window.location.href = '/home';
  };

  const register = async (
    email: string,
    password: string,
    nombreEmpresa: string,
    tipoNegocio: string,
    otroNegocio: string
  ) => {
    const res = await authFetch(REGISTER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        nombreEmpresa,
        tipoNegocio: tipoNegocio === 'Otro' ? otroNegocio : tipoNegocio,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al crear la cuenta. Intente de nuevo.');
    }

    return 'Registro exitoso. ¡Inicia sesión!';
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

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        const resultMessage = await register(
          email,
          password,
          nombreEmpresa,
          tipoNegocio,
          otroNegocio
        );
        setError(resultMessage);
        setIsLoginMode(true); 
      }
    } catch (err: any) {
      // Captura el error lanzado por login/register (que ya es específico)
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formStyle: React.CSSProperties = {
    padding: '25px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    maxWidth: '450px',
    margin: '30px auto',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    fontSize: '16px',
  };

  const submitButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#0077cc',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  };

  const switchButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#0077cc',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    marginTop: '15px',
    width: '100%',
    textAlign: 'center',
  };

  const tipoNegocioOptions = [
    'Retail/Tienda',
    'Manufactura',
    'Distribución/Mayorista',
    'Servicios',
    'Otro',
  ];

  return (
    <div className="auth-panel" style={{ textAlign: 'center' }}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ color: '#0077cc', marginBottom: '20px' }}>
          {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>

        {isLoading && <Spinner />}

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
              onChange={(e) => setTipoNegocio(e.target.value)}
              required
              style={inputStyle}
              disabled={isLoading}
            >
              <option value="" disabled>
                Selecciona Tipo de Negocio
              </option>
              {tipoNegocioOptions.map((type) => (
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