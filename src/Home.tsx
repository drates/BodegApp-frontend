import { useState, useEffect } from 'react';
import ItemForm from './ItemForm';
import ItemEgresoForm from './ItemEgresoForm';
import StockAlert from './StockAlert';
import HistorialMovimientos from './HistorialMovimientos';
import ItemList from './ItemList';
import Spinner from './Spinner';
import { authFetch } from './utils/authFetch';

type Props = {
    userInfo: {
        email: string;
        role: string;
        companyName: string;
    };
};

function Home({ userInfo }: Props) {
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [reloadFlag, setReloadFlag] = useState(0); 
    const [lowStockItems, setLowStockItems] = useState<
        { productCode: string; productName: string; boxes: number }[]
    >([]);

    const togglePanel = (panelName: string | null) => {
        setActivePanel(prev => (prev === panelName ? null : panelName));
    };

    const handleReload = () => {
        setReloadFlag(prev => prev + 1);
        setActivePanel(null);
        checkLowStock();
    };

    const logout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const checkLowStock = async () => {
    try {
        const response = await authFetch('/api/ItemBatch/alertas', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) return;

        const data = await response.json();
        setLowStockItems(data);
    } catch (err) {
        console.error("Error al verificar stock bajo:", err);
    }
};


    useEffect(() => {
        setLoadingUser(false);
        checkLowStock();
    }, []);

    const navButtons = [
        { key: 'entrada', label: 'Registrar Entrada' },
        { key: 'salida', label: 'Registrar Salida' },
        { key: 'tabla', label: 'Ver Inventario' },
        { key: 'movimientos', label: 'Movimientos recientes' }
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
        padding: '0.5rem 0.4rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
    }}>
        {/* Columna izquierda: nombre y slogan */}
        <div style={{ flex: '1 1 auto', minWidth: '160px' }}>
            <img 
        src="/logo.svg" 
        alt="Logo BodegaFeliz"
        style={{margin: '5px', width: '23px', height: '23px' }}
    />
            <h1 style={{ margin: 0, fontSize: '1.2rem' }}>BodegaFeliz</h1>
            <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.9 }}>
                Inventario simple y eficiente
            </p>
        </div>

        {/* Columna derecha: panel de usuario */}
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            textAlign: 'right',
            fontSize: '0.70rem',
            gap: '0.2rem',
            marginTop: '0.4rem'
        }}>
            <span style={{ fontWeight: 'bold' }}>Usuario:</span>
            <span>{userInfo.email}</span>
            <button 
                onClick={logout}
                style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Cerrar sesión
            </button>
        </div>
    </div>

            {/* Contenido principal */}
            <div style={{ padding: '10px', maxWidth: '1200px', margin: '100px auto 0 auto' }}>
                <StockAlert lowStockItems={lowStockItems} />

                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                    {navButtons.map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => togglePanel(btn.key)}
                            style={{
                                height: '40px',
                                fontSize: '100%',
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
