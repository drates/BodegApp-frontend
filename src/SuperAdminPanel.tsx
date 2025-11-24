// SuperAdminPanel.tsx

import { useState, useEffect } from 'react';
import { authFetch } from './utils/authFetch';
import Spinner from './Spinner';

// 1. INTERFACES DE TIPIFICADO
interface UserInfo {
    email: string;
    role: string;
    companyName: string;
}

interface SuperAdminPanelProps {
    userInfo: UserInfo;
}

interface AggregatedMetric {
    date: string;
    newUsersCount: number;
    dailyActiveUsersCount: number;
    totalProductsCount: number;
    totalBoxesInStock: number;
    dailyUnitsMoved: number;
    userMetricsJson: string; 
}

interface MetricsResponse {
    metrics: AggregatedMetric | null;
    isUpdating: boolean; 
}

interface MetricCardProps {
    title: string;
    value: number | string | null | undefined;
}

// Componente para mostrar un valor de métrica (mantenido)
const MetricCard: React.FC<MetricCardProps> = ({ title, value }) => (
    <div style={{ 
        padding: '15px', 
        border: '1px solid #ccc', 
        borderRadius: '5px', 
        textAlign: 'center', 
        minWidth: '200px',
        flex: 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: '#f9f9f9'
    }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#555' }}>{title}</h4>
        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#0077cc' }}>
            {value !== undefined && value !== null ? value.toLocaleString('es-CL') : 'N/A'}
        </p>
    </div>
);

const handleLogout = () => {
    // 1. Limpia el token de sesión de localStorage
    localStorage.removeItem('token');
    // 2. Fuerza una recarga de la página para que App.tsx re-evalúe la sesión
    // y redirija al Landing/Login.
    window.location.reload(); 
};

// Componente Principal
function SuperAdminPanel({ userInfo }: SuperAdminPanelProps) {
    const [metricsResponse, setMetricsResponse] = useState<MetricsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const metrics = metricsResponse?.metrics;
    const isUpdating = metricsResponse?.isUpdating;

    useEffect(() => {
        let intervalId: number | null = null;

        const fetchMetrics = async () => {
            try {
                const res = await authFetch('/api/superadmin/metricas');
                if (!res.ok) throw new Error('Error al cargar métricas del superadmin');
                const data: MetricsResponse = await res.json();
                setMetricsResponse(data);
                setError(null);
                
                // 🛑 SE ELIMINA el control de setLoading(false) de aquí.
                // Anteriormente: setLoading(false) solo se llamaba si !data.isUpdating.
                // Esto causaba que el spinner inicial se quedara pegado si isUpdating era true.
                
                // Si la actualización ha terminado, limpiamos el intervalo inmediatamente
                if (!data.isUpdating && intervalId !== null) {
                    clearInterval(intervalId);
                }
            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar las métricas. Intente recargar.");
                // Si hay un error, también aseguramos que se detiene el spinner inicial.
            } finally {
                 // ✅ CORRECCIÓN CRÍTICA: Desactivar el spinner de carga inicial
                 // Esto asegura que el panel se muestre, incluso si isUpdating es true.
                 setLoading(false); 
            }
        };

        // Primera carga
        fetchMetrics();

        // Establecer el intervalo de recarga
        // Usamos window.setInterval para asegurar el tipo number retornado
        intervalId = window.setInterval(() => {
            // El `isUpdating` capturado aquí se usará.
            // La dependencia en el array [metricsResponse?.isUpdating] se encargará del cleanup/restart 
            // cuando isUpdating cambie de true a false.
            if (metricsResponse?.isUpdating) {
                 fetchMetrics();
            }
        }, 5000); // 5 segundos

        // Cleanup del intervalo
        // Esto se ejecutará al desmontar o cuando metricsResponse?.isUpdating cambie.
        return () => {
            if (intervalId !== null) {
                clearInterval(intervalId);
            }
        };

    }, [metricsResponse?.isUpdating]); // Dependencia clave

    // (Resto del componente JSX)
    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <Spinner />
                <p>Cargando panel de Superadministrador...</p>
            </div>
        );
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px', 
                paddingBottom: '10px',
                borderBottom: '1px solid #ccc'
            }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Panel de Superadministrador</h1>
                
                {/* BOTÓN DE LOGOUT */}
                <button 
                    onClick={handleLogout} // Llama a la función local
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#dc3545', 
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Cerrar Sesión
                </button>
            </div>
            
            <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#333' }}>
                Bienvenido, **{userInfo.email}**. Rol: {userInfo.role}.
            </p>

            {/* Alerta de Actualización */}
            {isUpdating && (
                <div style={{ 
                    padding: '15px', 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffeeba', 
                    color: '#856404', 
                    borderRadius: '5px', 
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    ⏳ Calculando métricas históricas en segundo plano. Los datos mostrados son del día **{new Date(metrics?.date || Date.now()).toLocaleDateString('es-CL')}**. El panel se actualizará automáticamente en unos segundos.
                </div>
            )}
            
            <h3 style={{ marginTop: '30px' }}>Resumen General (Data Agregada)</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                <MetricCard 
                    title="Usuarios Nuevos (Último Día Calc.)" 
                    value={metrics?.newUsersCount} 
                />
                <MetricCard 
                    title="Usuarios Activos (DAU)" 
                    value={metrics?.dailyActiveUsersCount} 
                />
                <MetricCard 
                    title="Unidades Movidas Diariamente" 
                    value={metrics?.dailyUnitsMoved} 
                />
                <MetricCard 
                    title="Productos Totales (Snapshot)" 
                    value={metrics?.totalProductsCount} 
                />
                <MetricCard 
                    title="Cajas Totales en Stock (Snapshot)" 
                    value={metrics?.totalBoxesInStock} 
                />
            </div>

        </div>
    );
}

export default SuperAdminPanel;