import { useState, useEffect } from 'react';
import { authFetch } from './utils/authFetch';
import Spinner from './Spinner';

// 🟢 CORRECCIÓN 1: Interfaz actualizada para coincidir con el JSON del Backend.
interface MetricsData {
    usuariosPorDia: { fecha: string; nuevos: number }[]; 
    movimientosPorDia: { fecha: string; total: number; unidadesEgresadas: number; cajasEgresadas: number }[];
    resumenGlobal: { 
        usuariosTotales: number; 
        productosTotales: number; 
        cajasTotales: number; 
        unidadesTotales: number; 
        movimientosTotales: number; 
        ingresosTotales: number; 
        egresosTotales: number; 
    }; 
    tablaPorUsuario: {
        userId: string;
        userName: string;
        productos: number;
        cajas: number;
        unidades: number;
        unidadesEgresadas30d: number;
    }[];
}

type Props = {
    userInfo: {
        email: string;
        role: string;
        companyName: string;
    };
};

function SuperAdminPanel({ userInfo }: Props) {
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Si el usuario no es SuperAdmin, redirigir o mostrar un mensaje
    if (userInfo.role !== 'Superadmin') {
        return (
            <div className="p-6 text-center text-red-600 font-bold">
                Acceso Denegado. Se requiere rol de Super Administrador.
            </div>
        );
    }

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            setError(null);
            try {
                // Corregida la ruta en authFetch a /api/superadmin/metricas (ya estaba correcta)
                const response = await authFetch("/api/superadmin/metricas", {
                    method: 'GET'
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: No se pudieron cargar las métricas.`);
                }
                
                const data: MetricsData = await response.json(); 
                setMetrics(data);

            } catch (err: any) {
                console.error("Error al obtener métricas:", err);
                setError(err.message || "Fallo al conectar con el servicio de métricas.");
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600 font-bold">{error}</div>;
    }

    // Función auxiliar para formatear la fecha a DD/MM/AAAA
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL');
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">Panel de Super Administración</h1>
            
            {/* --- RESUMEN GLOBAL --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
                    <h2 className="text-xl font-semibold mb-2 text-blue-600">Resumen Global</h2>
                    <p>Total de Usuarios: **{metrics?.resumenGlobal?.usuariosTotales ?? 'N/A'}**</p>
                    <p>Total de Productos: **{metrics?.resumenGlobal?.productosTotales ?? 'N/A'}**</p>
                    <p>Total de Cajas en Stock: **{metrics?.resumenGlobal?.cajasTotales ?? 'N/A'}**</p>
                    <p>Total de Unidades en Stock: **{metrics?.resumenGlobal?.unidadesTotales ?? 'N/A'}**</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-600">
                    <h2 className="text-xl font-semibold mb-2 text-green-600">Transacciones y Valor</h2>
                    <p>Total de Movimientos (30D): **{metrics?.resumenGlobal?.movimientosTotales ?? 'N/A'}**</p>
                    <p>Total de Ingresos (Cajas): **{metrics?.resumenGlobal?.ingresosTotales ?? 'N/A'}**</p>
                    <p>Total de Egresos (Cajas): **{metrics?.resumenGlobal?.egresosTotales ?? 'N/A'}**</p>
                </div>

                {/* --- Usuarios por Día --- */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-600 lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-2 text-purple-600">Crecimiento de Usuarios (Adquisición)</h2>
                    <p className="mb-3">**Nuevos Usuarios por Día (Últimos 5 registros):**</p>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nuevos Usuarios</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {metrics?.usuariosPorDia.slice(-5).map((u, index) => ( // Muestra los últimos 5 días
                                <tr key={index}>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{formatDate(u.fecha)}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 font-bold">{u.nuevos}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Tabla por Usuario (Segmentación) --- */}
            <div className="bg-white p-6 rounded-lg shadow-xl mt-8">
                <h2 className="text-xl font-semibold mb-4 text-indigo-700">Segmentación por Usuario (Heavy Users)</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Productos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Cajas Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Unidades Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Egresos (30D)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Ordenamos por Cajas de forma descendente para destacar a los "Heavy Users" */}
                            {metrics?.tablaPorUsuario
                                .sort((a, b) => b.cajas - a.cajas)
                                .map((u) => (
                                <tr key={u.userId} className={u.cajas > 5 ? 'bg-yellow-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.userName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.productos}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{u.cajas}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.unidades}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-semibold">{u.unidadesEgresadas30d}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-gray-500 mt-8">Datos cargados con éxito desde el Backend de Producción.</p>
        </div>
    );
}

export default SuperAdminPanel;