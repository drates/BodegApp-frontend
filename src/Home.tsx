import { useState, useEffect, useCallback } from 'react';
import ItemForm from './ItemForm';
import ItemEgresoForm from './ItemEgresoForm';
import StockAlert from './StockAlert';
import HistorialMovimientos from './HistorialMovimientos';
import ItemList from './ItemList';
import { authFetch } from './utils/authFetch';
import Spinner from './Spinner';
import { useAuth } from './AuthContext'; // Importamos useAuth para logout

function Home() {
    const { logout } = useAuth(); // Usamos el logout del contexto
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    // ✅ Mantenemos reloadFlag para forzar el re-montaje/re-fetch de ItemList/HistorialMovimientos
    const [reloadFlag, setReloadFlag] = useState(0); 

    const togglePanel = (panelName: string | null) => {
        setActivePanel(prev => (prev === panelName ? null : panelName));
    };

    // Función para forzar la recarga de datos en ItemList y HistorialMovimientos
    const handleReload = () => {
        setReloadFlag(prev => prev + 1);
        setActivePanel(null); // Opcional: Cerrar el formulario después de la acción
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000); // Ocultar alerta después de 3s
    };
    
    // Función para obtener la información del usuario
    const fetchUserInfo = useCallback(async () => {
        setLoadingUser(true);
        try {
            // PASO 1: Usar la ruta RELATIVA. authFetch completará la URL base.
            const response = await authFetch('/api/auth/me');

            // PASO 2: Leer y parsear el cuerpo JSON de la respuesta
            const data = await response.json();
            setUserInfo(data);
        } catch (error) {
            console.error('Error al obtener info del usuario:', error);
            // En caso de error (ej: token expirado 401), forzamos el logout.
            logout(); 
        } finally {
            setLoadingUser(false);
        }
    }, [logout]); // Dependencia de logout para useCallback

    // 🔄 Efecto para cargar la info del usuario al montar el componente
    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    // Define los botones de navegación
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
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            {/* Encabezado */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#007bff' }}>Sistema de Gestión de Inventario</h1>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '15px', color: '#333' }}>
                        Bienvenido, **{userInfo?.companyName || 'Usuario'}** ({userInfo?.role})
                    </span>
                    <button 
                        onClick={logout} // Usamos la función logout del contexto
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

            {/* Alerta de Éxito */}
            <StockAlert 
                message="✅ Operación registrada con éxito. Inventario actualizado." 
                isVisible={showSuccessAlert} 
            />

            {/* Contenido principal */}
            <div style={{ marginTop: '20px' }}>
                {/* Navegación/Botones de Acción */}
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