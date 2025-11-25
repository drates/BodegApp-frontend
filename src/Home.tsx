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
    // 🟢 NUEVO ESTADO: Para la notificación de éxito
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const togglePanel = (panelName: string | null) => {
        setActivePanel(prev => (prev === panelName ? null : panelName));
    };

    const handleReload = () => {
        setReloadFlag(prev => prev + 1);
        setActivePanel(null);
        checkLowStock();
    };

    // 🟢 NUEVA FUNCIÓN: Muestra el mensaje de éxito y luego recarga. Reemplaza a handleReload en los formularios.
    const handleSuccess = () => {
        setSuccessMessage("Movimiento registrado con éxito.");
        handleReload();
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

    // 🟢 NUEVO useEffect: Para ocultar el mensaje después de 7 segundos
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 7000); // 7000 milisegundos = 7 segundos
            return () => clearTimeout(timer); // Limpieza del temporizador
        }
    }, [successMessage]);

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
                
                {/* 🟢 NOTIFICACIÓN DE ÉXITO (Condicional, se sitúa arriba de StockAlert) */}
                {successMessage && (
                    <div style={{
                        padding: '6px 15px',
                        marginBottom: '20px',
                        backgroundColor: '#d4edda', // Fondo verde claro
                        color: '#155724',           // Texto verde oscuro
                        border: '1px solid #c3e6cb',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <span role="img" aria-label="check" style={{ marginRight: '8px' }}>✅</span>
                        {successMessage}
                    </div>
                )}

                {/* STOCK ALERT se renderiza incondicionalmente debajo de la alerta de éxito */}
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

                {/* Bloque de Onboarding / Bienvenida */}
                {activePanel === null && (
                    <div style={{
                        //marginTop: '10px',
                        padding: '10px 30px',
                        backgroundColor: '#f7f7f7',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#333'
                    }}>
                        <h2 style={{ color: '#0466C9', fontSize: '1.15rem', marginBottom: '15px' }}>
                            👋 ¡Bienvenido/a a tu BodegaFeliz!
                        </h2>
                        
                        <ul style={{ 
                            listStyleType: 'none', 
                            padding: 0, 
                            fontSize: '0.9rem',
                            maxWidth: '500px', 
                            margin: '0 auto',
                            textAlign: 'left'
                        }}>
                            <li style={{ marginBottom: '10px' }}>
                                Entrada: <i>ingresa stock a la bodega</i>.
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                Salida: <i>registra salida de stock</i>.
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                Ver Inventario: <i>revisa tu inventario actualizado</i>.
                            </li>
                            <li style={{ marginBottom: '20px' }}>
                                Movimientos: <i>revisa movimientos de inventario recientes</i>.
                            </li>
                        </ul>
                        
                    </div>
                )}

                {/* 🟢 Reemplazar handleReload por handleSuccess en los formularios */}
                {activePanel === 'entrada' && <ItemForm onItemCreated={handleSuccess} />}
                {activePanel === 'salida' && <ItemEgresoForm onItemUpdated={handleSuccess} />}
                {activePanel === 'tabla' && <ItemList key={reloadFlag} />} 
                {activePanel === 'movimientos' && <HistorialMovimientos key={reloadFlag} />}
            </div>
            {/* 🟢 FOOTER (Nuevo Bloque) */}
    <div style={{
        backgroundColor: '#f1f1f1',
        color: '#555',
        textAlign: 'center',
        padding: '10px 10px',
        marginTop: '30px', // Espacio para separarlo del contenido
        borderTop: '1px solid #e0e0e0',
        fontSize: '0.8rem'
    }}>
        <p style={{ margin: '0 0 10px 0', fontFamily: 'Alata, sans-serif' }}>
            &copy; {new Date().getFullYear()} BodegaFeliz
        </p>
        <div>
            <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSct-DzTzT6FdMVF-_mjIwC4WchBtIyLCHxk17Del4sbJ8x87A/viewform?usp=publish-editor" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#0466C9', textDecoration: 'none', margin: '0 10px', fontWeight: 'bold' }}
            >
                Envíanos Feedback
            </a>
            |
            <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSetAoQZESZN5q1EoZ71VxdN_7rqKDYCrpymITE1i5JcX5iHsw/viewform?usp=dialog" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#0466C9', textDecoration: 'none', margin: '0 10px', fontWeight: 'bold' }}
            >
                Contacto
            </a>
        </div>
    </div>
        </div>
    );
}

export default Home;