import React, { useState } from 'react';
import { useAuth } from './AuthContext'; // Importamos el hook useAuth

function AuthPanel() {
    // Obtenemos la función login del contexto (que ahora maneja la llamada a la API, el token y el rol)
    const { login } = useAuth(); 

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
            const registerEndpoint = 'http://localhost:5000/auth/register';
            const registerPayload = {
                email,
                password,
                nombreEmpresa,
                tipoNegocio: tipoNegocio === 'Otro' ? otroNegocio : tipoNegocio
            };
            try {
                const res = await fetch(registerEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registerPayload)
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: 'Error de servidor desconocido.' }));
                    const errorMessage = errorData.message || 'Error en el registro. Intente con otro correo.';
                    setError(errorMessage);
                    setIsLoading(false);
                    return;
                }
                
                // Si el registro es exitoso, intentamos iniciar sesión automáticamente
                setError('🎉 ¡Registro exitoso! Iniciando sesión...');
                // Nota: Usar setTimeout para dar tiempo a ver el mensaje (UX)
                await new Promise(resolve => setTimeout(resolve, 1500)); 

            } catch (err) {
                console.error('Fallo en el registro:', err);
                setError('Error de conexión durante el registro. Intente nuevamente.');
                setIsLoading(false);
                return;
            }
        }
        
        // ==========================================================
        // Lógica de Login (Usada directamente o después del registro)
        // ==========================================================
        try {
            // Llama a la función login del contexto (ella maneja la API, el token y el rol)
            await login(email, password); 
            // Si el login es exitoso, el AuthContext actualiza el estado, 
            // y AppRouter se encarga automáticamente de la redirección.
            
        } catch (err: any) {
            // Muestra el error que la función login lanzó (credenciales inválidas, etc.)
            setError(err.message || 'Error al intentar iniciar sesión. Revise credenciales.');
        } finally {
            // Este finally se ejecuta después del intento de login (exitoso o fallido)
            setIsLoading(false);
        }
    };

    return (
        <div style={{ 
            padding: '1.5rem', 
            border: '1px solid #e0e0e0', 
            borderRadius: '12px', 
            maxWidth: '450px', 
            margin: '0 auto', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff'
        }}>
            <h3 style={{ textAlign: 'center', color: '#007bff' }}>{isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="email"
                    placeholder="Correo"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                />

                {/* Campos adicionales solo en modo registro */}
                {!isLoginMode && (
                    <>
                        <input
                            type="text"
                            placeholder="Nombre de la empresa"
                            value={nombreEmpresa}
                            onChange={e => setNombreEmpresa(e.target.value)}
                            required
                            style={inputStyle}
                        />

                        {/* Dropdown para tipo de negocio */}
                        <select
                            value={tipoNegocio}
                            onChange={e => setTipoNegocio(e.target.value)}
                            required
                            style={inputStyle}
                        >
                            <option value="">Selecciona tipo de negocio</option>
                            <option value="Ferretería">Ferretería</option>
                            <option value="Farmacia">Farmacia</option>
                            <option value="Tienda">Tienda</option>
                            <option value="Bar/restaurant">Bar/restaurant</option>
                            <option value="Otro">Otro (ingresa tu respuesta)</option>
                        </select>

                        {/* Campo adicional si se elige "Otro" */}
                        {tipoNegocio === 'Otro' && (
                            <input
                                type="text"
                                placeholder="Especifica tu tipo de negocio"
                                value={otroNegocio}
                                onChange={e => setOtroNegocio(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        )}
                    </>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={buttonStyle}
                >
                    {isLoading ? 'Cargando...' : (isLoginMode ? 'Entrar' : 'Crear cuenta')}
                </button>
                <button 
                    type="button" 
                    onClick={() => {
                        setIsLoginMode(!isLoginMode);
                        setError(''); // Limpiar errores al cambiar de modo
                    }}
                    style={switchButtonStyle}
                >
                    {isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
                {error && <p style={{ color: error.includes('exitoso') ? '#28a745' : '#dc3545', textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>{error}</p>}
            </form>
        </div>
    );
}

export default AuthPanel;

// Estilos locales simplificados
const inputStyle: React.CSSProperties = {
    padding: '10px',
    border: '1px solid #ced4da',
    borderRadius: '8px',
    boxSizing: 'border-box'
};

const buttonStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease'
};

const switchButtonStyle: React.CSSProperties = {
    padding: '10px',
    backgroundColor: '#f8f9fa',
    color: '#007bff',
    border: '1px solid #007bff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginTop: '5px'
};