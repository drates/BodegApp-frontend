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
        { key: 'entrada', label: 'Entrada' },
        { key: 'salida', label: 'Salida' },
        { key: 'tabla', label: 'Ver Inventario' },
        { key: 'movimientos', label: 'Movimientos' }
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
        background: '#0466C9',
        color: '#fff',
        padding: '0.5rem 0.6rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
    }}>
        {/* Columna izquierda: nombre y slogan */}
<div style={{ flex: '1 1 auto', minWidth: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img 
      src="/logoheader.svg" 
      alt="Logo BodegaFeliz"
      style={{ width: '24px', height: '24px', verticalAlign: 'middle', marginRight: '3px' }}
    />
    <h1 style={{ margin: 0, fontFamily: 'Alata, sans-serif', fontSize: '1.35rem', lineHeight: '1' }}>BodegaFeliz</h1>
  </div>
  <p style={{ margin: 0, fontSize: '0.70rem', opacity: 0.9, paddingTop: '5px' }}>
    Inventario simple y eficiente
  </p>
</div>

        {/* Columna derecha: panel de usuario */}
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            textAlign: 'right',
            fontSize: '0.55rem',
            gap: '0.2rem',
            marginTop: '0.2rem'
        }}>
            <span style={{ fontWeight: 'bold' }}>Usuario:</span>
            <span>{userInfo.email}</span>
            <button 
                onClick={logout}
                style={{
                    padding: '4px 8px',
                    fontSize: '0.60rem',
                    backgroundColor: '#d1d1d1ff',
                    color: '#0466C9',
                    border: 'none',
                    borderRadius: '4px',
                    alignSelf: 'flex-end',
                    marginRight: '-0.2rem',
                    cursor: 'pointer'
                }}
            >
                Cerrar sesión
            </button>
        </div>
    </div>

            {/* Contenido principal */}
            <div style={{ padding: '10px', maxWidth: '1200px', margin: '70px auto 0 auto' }}>
                <StockAlert lowStockItems={lowStockItems} />

                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                    {navButtons.map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => togglePanel(btn.key)}
                            style={{
                                height: '40px',
                                width: '120px',
                                fontSize: '90%',
                                backgroundColor: activePanel === btn.key ? '#0466C9' : '#ffffff',
                                color: activePanel === btn.key ? '#ffffff' : '#0466C9',
                                border: '3px solid #0466C9',
                                borderRadius: '3px',
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
