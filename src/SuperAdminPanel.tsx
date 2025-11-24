// SuperAdminPanel.tsx

import { useState, useEffect } from 'react';
import { authFetch } from './utils/authFetch';
import Spinner from './Spinner';

// 1. INTERFACES ACTUALIZADAS para el nuevo DTO del Backend
interface AggregatedMetric {
    date: string;
    newUsersCount: number;
    dailyActiveUsersCount: number;
    totalProductsCount: number;
    totalBoxesInStock: number;
    dailyUnitsMoved: number;
    userMetricsJson: string; 
    // Añadir el resto de las métricas que el backend calcule (e.g., TablaPorUsuario)
    // Para simplificar, asumiremos que el backend ahora solo devuelve el objeto AggregatedMetric, 
    // y tú lo adaptas aquí. Por ahora, nos centraremos en las métricas de alto nivel.
}

interface MetricsResponse {
    metrics: AggregatedMetric | null;
    isUpdating: boolean; // El flag de cálculo en segundo plano
}

// Componente para mostrar un valor de métrica (opcional, pero ayuda a la limpieza)
interface MetricCardProps {
    title: string;
    value: number | string | null | undefined;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value }) => (
    <div style={{ 
        padding: '15px', 
        border: '1px solid #ccc', 
        borderRadius: '5px', 
        textAlign: 'center', 
        minWidth: '150px',
        backgroundColor: '#f9f9f9'
    }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#666' }}>{title}</p>
        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#0077cc' }}>
            {value !== null && value !== undefined ? value.toLocaleString() : 'N/A'}
        </h3>
    </div>
);


function SuperAdminPanel() {
    const [metricsData, setMetricsData] = useState<MetricsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false); // Estado para controlar el refresh

    // Función principal para obtener las métricas
    const fetchMetrics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await authFetch('/api/superadmin/metricas');
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error al obtener métricas: ${res.status} - ${errorText}`);
            }
            
            const data: MetricsResponse = await res.json();
            setMetricsData(data);
            setIsUpdating(data.isUpdating); // 🔥 CRÍTICO: Guardar el estado de actualización

        } catch (err) {
            console.error(err);
            setError('Error al cargar las métricas. Intenta recargar.');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        window.location.href = '/'; // Redirige a la landing page
    };

    // 💡 useEffect 1: Carga inicial al montar
    useEffect(() => {
        fetchMetrics();
    }, []);

    // 💡 useEffect 2: Lógica de REFRESH AUTOMÁTICO (Solución limpia)
    useEffect(() => {
        // Usamos el tipo estándar de navegador para evitar el error 'NodeJS.Timeout'
        let timer: number | undefined; 
        
        if (isUpdating) {
            console.log("Cálculo en curso. Programando re-fetch en 30 segundos...");
            
            // Usamos window.setTimeout y window.clearTimeout para mayor claridad
            timer = window.setTimeout(() => {
                fetchMetrics(); 
            }, 30000); // Reintentar cada 30 segundos

        }
        
        // Función de limpieza para asegurar que el timer se detenga si el componente se desmonta 
        // o si isUpdating cambia a false.
        return () => {
            if (timer) {
                window.clearTimeout(timer);
            }
        };
    }, [isUpdating]); // Dependencia CRÍTICA: se ejecuta cada vez que 'isUpdating' cambia

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                <Spinner />
            </div>
        );
    }

    if (error) {
        return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
    }
    
    const metrics = metricsData?.metrics;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button 
                    onClick={logout} 
                    style={{
                        backgroundColor: '#adababff', // Color rojo para destacar
                        color: 'black',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Cerrar Sesión 🔒
                </button>
            </div>
            <h2>Panel de Superadmin - Métricas Globales</h2>
            
            <hr />

            {/* 💡 Mensaje de Actualización (visible si IsUpdating es true) */}
            {isUpdating && metrics && (
                <div style={{ 
                    padding: '15px', 
                    marginBottom: '20px', 
                    backgroundColor: '#fff3cd', 
                    color: '#856404', 
                    border: '1px solid #ffeeba',
                    borderRadius: '5px',
                    fontWeight: 'bold'
                }}>
                    ⏳ Calculando métricas históricas en segundo plano. Los datos mostrados son del día **{new Date(metrics.date).toLocaleDateString()}**. El panel se actualizará automáticamente en unos segundos.
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

            {/* Aquí puedes añadir la tabla o gráficos si las incluyes en el modelo AggregatedMetric */}

        </div>
    );
}

export default SuperAdminPanel;