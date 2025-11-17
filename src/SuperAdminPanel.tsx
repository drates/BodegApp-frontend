// SuperAdminPanel.tsx

import { useState, useEffect } from 'react';
import { authFetch } from './utils/authFetch';
import Spinner from './Spinner';

// Definición mínima de los tipos de métricas para evitar el error TS2739
interface MetricsData {
    usuariosPorDia: any[]; 
    movimientosPorDia: any[];
    resumenGlobal: { totalItems: number; totalUsers: number; }; 
    tablaPorUsuario: any[];
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

    // 🟢 NUEVA FUNCIÓN: Lógica para cerrar la sesión
    const logout = () => {
        localStorage.removeItem('token');
        // Esto fuerza a App.tsx a re-evaluar la sesión y mostrar el Login
        window.location.href = '/'; 
    };

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            setError(null);
            try {
                // 💡 CORRECCIÓN de ruta: Asegurarse que usa la ruta completa.
                const response = await authFetch("/api/superadmin/metricas", {
                    method: 'GET'
                });
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
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

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h1 className="text-3xl font-extrabold text-gray-900">Panel de Super Administración</h1>
                {/* 🟢 NUEVO BOTÓN: Botón de Logout */}
                <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                    Cerrar Sesión
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-blue-600">Resumen Global</h2>
                    <p>Total de Usuarios: {metrics?.resumenGlobal?.totalUsers ?? 'N/A'}</p>
                    {/* 💡 CORRECCIÓN DE NOMBRE ASUMIDA: De 'totalItems' a 'Total de Productos' */}
                    <p>Total de Productos: {metrics?.resumenGlobal?.totalItems ?? 'N/A'}</p>
                    {/* ... otras métricas ... */}
                </div>
            </div>

            {/* ... el resto del contenido del panel ... */}

            <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-700">Segmentación por Usuario</h2>
            {/* ... la tabla por usuario ... */}
            
        </div>
    );
}

export default SuperAdminPanel;