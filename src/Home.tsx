import { useState, useEffect, useCallback } from 'react';
import ItemForm from './ItemForm';
import ItemEgresoForm from './ItemEgresoForm';
import StockAlert from './StockAlert';
import HistorialMovimientos from './HistorialMovimientos';
import ItemList from './ItemList';
import { authFetch } from './utils/authFetch';
import Spinner from './Spinner';

function Home() {
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    // ✅ Mantenemos reloadFlag para forzar el re-montaje/re-fetch de ItemList/HistorialMovimientos
    const [reloadFlag, setReloadFlag] = useState(0); 

    const togglePanel = (panelName: string | null) => {
        setActivePanel(prev => (prev === panelName ? null : panelName));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const fetchUserInfo = useCallback(async () => {
    try {
        // PASO 1: Obtener el objeto Response completo
        const response = await authFetch('http://localhost:5000/auth/me', {
            method: 'GET'
        });

        // PASO 2: Leer y parsear el cuerpo JSON de la respuesta
        const data = await response.json(); 
        
        // PAUSAR (opcional)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // PASO 3: Guardar el objeto JSON de datos del usuario
        setUserInfo(data); 
    } catch (err) {
        console.error('Error al obtener datos del usuario:', err);
    } finally {
        setLoadingUser(false);
    }
}, []);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    // 🚨 CORRECCIÓN CLAVE: handleReload ahora solo fuerza la recarga (fetch)
    // y maneja el estado de éxito sin depender de manipular el Local Storage.
    const handleReload = () => {
        setReloadFlag(prev => prev + 1); // Forzar re-fetch en ItemList/HistorialMovimientos
        setShowSuccessAlert(true);
        // Ocultar alerta después de 6 segundos
        setTimeout(() => setShowSuccessAlert(false), 6000); 
        togglePanel(null); // Opcional: Cerrar el panel del formulario después de la acción
    };

    if (loadingUser) return <Spinner />;

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header - Sin cambios críticos, mantiene la UI */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: '#0077cc',
                color: '#fff',
                padding: '0.3rem 0.3rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
            }}>
                <h1>BodegApp</h1>
                <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>
                    Inventario simple y eficiente - para todo tipo de negocios
                </p>

                {userInfo && (
                    <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.9rem',
                        background: '#005fa3',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        color: '#fff'
                    }}>
                        <span>Usuario: {userInfo.email}</span>
                        <button
                            onClick={handleLogout}
                            style={{
                                marginLeft: '1rem',
                                background: '#ffffff',
                                color: '#0077cc',
                                border: 'none',
                                padding: '0.3rem 0.6rem',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>

            {/* Main content */}
            <div style={{ marginTop: '90px' }}>
                {showSuccessAlert && (
                    <div style={{
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        padding: '0.8rem 1rem',
                        borderRadius: '6px',
                        marginBottom: '1rem',
                        border: '1px solid #c3e6cb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        ✅ Movimiento registrado de forma exitosa. Refrescando datos...
                    </div>
                )}

                <StockAlert />

                {/* Menu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '2rem' }}>
                    {[
                        { label: 'Ingreso de Entradas', key: 'entrada' },
                        { label: 'Registro de Salidas', key: 'salida' },
                        { label: 'Ver Inventario', key: 'tabla' },
                        { label: 'Movimientos recientes', key: 'movimientos' }
                    ].map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => togglePanel(btn.key)}
                            style={{
                                height: '40px',
                                fontSize: '105%',
                                backgroundColor: activePanel === btn.key ? '#007bff' : '#ffffff',
                                color: activePanel === btn.key ? '#ffffff' : '#007bff',
                                border: '2px solid #007bff',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* Panels */}
                {/* Las funciones onItemCreated y onItemUpdated llaman a handleReload */}
                {activePanel === 'entrada' && <ItemForm onItemCreated={handleReload} />}
                {activePanel === 'salida' && <ItemEgresoForm onItemUpdated={handleReload} />}
                
                {/* ✅ Estos componentes usarán el 'reloadFlag' en su key para forzar la recarga desde el servidor */}
                {activePanel === 'tabla' && <ItemList key={reloadFlag} />} 
                {activePanel === 'movimientos' && <HistorialMovimientos key={reloadFlag} />}
            </div>
        </div>
    );
}

export default Home;