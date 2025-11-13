import React, { useState } from 'react';
import { useAuth } from './AuthContext'; // Importamos el hook useAuth
import { authFetch } from './utils/authFetch'; // Importamos authFetch para registro
import Spinner from './Spinner'; // Asumo que tienes un componente Spinner

// 💡 Defino el endpoint de registro aquí, usando authFetch para resolver la URL base
const REGISTER_ENDPOINT = '/api/auth/register'; 

function AuthPanel() {
    // Obtenemos la función login del contexto (que ahora maneja la llamada a la API, el token y el rol)
const login = async (email: string, password: string) => {
  const res = await fetch('/api/auth/login', {
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
  window.location.href = '/home'; // ✅ redirige al dashboard
};

    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombreEmpresa, setNombreEmpresa] = useState('');
    const [tipoNegocio, setTipoNegocio] = useState('');
    const [otroNegocio, setOtroNegocio] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Estado de carga local para el formulario

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // ==========================================================
        // Lógica de Registro (Maneja el registro pero luego usa login)
        // ==========================================================
        if (!isLoginMode) {
            // Validación de campos de registro
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
                // Nota: Asumo que el rol lo asigna el backend por defecto a 'Admin'
            };

            try {
                // 🛑 CORRECCIÓN: Usar la ruta RELATIVA. authFetch completará la URL.
                const response = await authFetch(REGISTER_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registrationData)
                });

                if (response.ok) {
                    setError('✅ Registro exitoso. Iniciando sesión...');
                    // Intentamos iniciar sesión inmediatamente después del registro
                    await login(email, password);
                } else {
                    // Si response.ok es false, authFetch ya habrá lanzado un error 
                    // que podemos capturar en el catch, pero por seguridad:
                     const errorData = await response.json();
                     throw new Error(errorData.message || 'Error desconocido durante el registro.');
                }
            } catch (err: any) {
                // Captura el error lanzado por authFetch o por el manejo de JSON/red
                setError(err.message || 'Hubo un error al registrar la cuenta.');
            } finally {
                setIsLoading(false);
            }
        // ==========================================================
        // Lógica de Login
        // ==========================================================
        } else {
            try {
                // Usamos la función login del contexto.
                await login(email, password);
                // El contexto se encarga de cambiar el estado global y renderizar Home.
            } catch (err: any) {
                setError(err.message || 'Error de inicio de sesión. Verifique sus credenciales.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const businessTypes = ['Retail', 'Distribución', 'Manufactura', 'Servicios', 'Otro'];

    // Estilos locales simplificados (manteniendo la apariencia anterior)
    const inputStyle: React.CSSProperties = {
        padding: '10px',
        border: '1px solid #ced4da',
        borderRadius: '8px',
        boxSizing: 'border-box',
        marginBottom: '10px',
        width: '100%' // Usar 100% dentro del contenedor
    };

    const buttonStyle: React.CSSProperties = {
        padding: '10px 15px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    };
    
    const submitButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: isLoginMode ? '#007bff' : '#28a745',
        color: 'white',
        width: '100%',
        marginBottom: '10px'
    };

    const switchButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: 'transparent',
        color: '#6c757d',
        border: '1px solid #6c757d',
        width: '100%',
        marginTop: '10px'
    };
    

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            backgroundColor: '#f8f9fa' 
        }}>
            <form 
                onSubmit={handleSubmit} 
                style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '400px',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#343a40' }}>
                    {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </h2>
                
                {isLoading && <div style={{ textAlign: 'center', margin: '15px 0' }}><Spinner /></div>}
                
                {/* Campos de Login/Registro */}
                <input 
                    type="email" 
                    placeholder="Correo Electrónico" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    style={inputStyle} 
                    disabled={isLoading}
                />
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    style={inputStyle} 
                    disabled={isLoading}
                />

                {/* Campos Adicionales de Registro */}
                {!isLoginMode && (
                    <>
                        <input 
                            type="text" 
                            placeholder="Nombre de la Empresa" 
                            value={nombreEmpresa} 
                            onChange={e => setNombreEmpresa(e.target.value)} 
                            required 
                            style={inputStyle} 
                            disabled={isLoading}
                        />
                        <select 
                            value={tipoNegocio} 
                            onChange={e => {
                                setTipoNegocio(e.target.value);
                                if (e.target.value !== 'Otro') setOtroNegocio('');
                            }} 
                            required 
                            style={inputStyle} 
                            disabled={isLoading}
                        >
                            <option value="">Seleccione Tipo de Negocio</option>
                            {businessTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {tipoNegocio === 'Otro' && (
                            <input 
                                type="text" 
                                placeholder="Especifique otro tipo de negocio" 
                                value={otroNegocio} 
                                onChange={e => setOtroNegocio(e.target.value)} 
                                required 
                                style={inputStyle} 
                                disabled={isLoading}
                            />
                        )}
                    </>
                )}

                {/* Botón de Submit */}
                <button 
                    type="submit" 
                    style={submitButtonStyle} 
                    disabled={isLoading}
                >
                    {isLoading ? 'Cargando...' : (isLoginMode ? 'Iniciar Sesión' : 'Crear cuenta')}
                </button>
                
                {/* Botón de Cambio de Modo */}
                <button 
                    type="button" 
                    onClick={() => {
                        setIsLoginMode(!isLoginMode);
                        setError(''); // Limpiar errores al cambiar de modo
                    }}
                    style={switchButtonStyle}
                    disabled={isLoading}
                >
                    {isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
                
                {/* Mensaje de Error/Éxito */}
                {error && <p style={{ 
                    color: error.includes('exitoso') ? '#28a745' : '#dc3545', 
                    textAlign: 'center', 
                    marginTop: '10px', 
                    fontWeight: 'bold' 
                }}>{error}</p>}
            </form>
        </div>
    );
}

export default AuthPanel;