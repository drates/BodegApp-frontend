import { useState, useEffect } from 'react';
import ItemForm from './ItemForm';
import ItemEgresoForm from './ItemEgresoForm';
import StockAlert from './StockAlert';
import HistorialMovimientos from './HistorialMovimientos';
import ItemList from './ItemList';
import Spinner from './Spinner';
import { authFetch } from './utils/authFetch';

function Home() {
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [reloadFlag, setReloadFlag] = useState(0); 

    const togglePanel = (panelName: string | null) => {
        setActivePanel(prev => (prev === panelName ? null : panelName));
    };

    const handleReload = () => {
        setReloadFlag(prev => prev + 1);
        setActivePanel(null);
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
    };

    const logout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoadingUser(false);
                return;
            }

            try {
                const res = await authFetch('/api/auth/me');
                if (!res.ok) throw new Error('401');
                const data = await res.json();
                setUserInfo(data);
            } catch {
                logout();
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserInfo();
    }, []);

    const navButtons = [
        { key: 'entrada', label: 'Ingresar Stock' },
        { key: 'salida', label: 'Registrar Egreso' },
        { key: 'tabla', label: 'Ver Inventario' },
        { key: 'movimientos', label: 'Historial' }
    ];

    if (loadingUser) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner />
                <p style={{ marginLeft: '10px' }}>Cargando información del usuario...</p>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }}>
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
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h1 style={{ margin: 0 }}>BodegApp</h1>
                    <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>
                        Inventario simple y eficiente - para todo tipo de negocios
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.95rem' }}>
                        Usuario: <strong>{userInfo?.email}</strong>
                    </span>
                    <button 
                        onClick={logout}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Contenido principal */}
            <div style={{ padding: '20px', maxWidth: '1200px', margin: '120px auto 0 auto' }}>
                <StockAlert 
                    message="✅ Operación registrada con éxito. Inventario actualizado." 
                    isVisible={showSuccessAlert} 
                />

                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                    {navButtons.map(btn => (
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

                {activePanel === 'entrada' && <ItemForm onItemCreated={handleReload} />}
                {activePanel === 'salida' && <ItemEgresoForm onItemUpdated={handleReload} />}
                {activePanel === 'tabla' && <ItemList key={reloadFlag} />} 
                {activePanel === 'movimientos' && <HistorialMovimientos key={reloadFlag} />}
            </div>
        </div>
    );
}

export default Home;
