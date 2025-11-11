import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Asume que ya corregiste AuthContext
import Spinner from './Spinner';
import { authFetch } from './utils/authFetch'; // Asume que authFetch lee el token de localStorage

// --- Definiciones de Tipos (CORREGIDAS a camelCase para coincidir con el JSON) ---

type GlobalMetrics = {
    usuariosTotales: number;
    productosTotales: number;
    cajasTotales: number;
    unidadesTotales: number;
    movimientosTotales: number; 
    ingresosTotales: number;
    egresosTotales: number;
};

type UserMetric = {
    userId: string;
    userName: string;
    productos: number;
    cajas: number;
    unidades: number;
    unidadesEgresadas30d: number;
};

type MetricsData = {
    usuariosPorDia: { fecha: string, nuevos: number }[];
    movimientosPorDia: any[];
    resumenGlobal: GlobalMetrics;
    tablaPorUsuario: UserMetric[];
};

const defaultMetrics: MetricsData = {
    usuariosPorDia: [],
    movimientosPorDia: [],
    resumenGlobal: {
        usuariosTotales: 0, productosTotales: 0, cajasTotales: 0,
        unidadesTotales: 0, movimientosTotales: 0, ingresosTotales: 0, egresosTotales: 0
    },
    tablaPorUsuario: []
};


function SuperAdminPanel() {
    // 🛑 1. OBTENER EL TOKEN Y EL ESTADO DE CARGA DE AUTENTICACIÓN ('loading' es el isAuthLoading)
    const { 
        isSuperAdmin, 
        loading: isLoadingAuth, // Renombramos para claridad
        token, 
        logout 
    } = useAuth(); 

    const [metrics, setMetrics] = useState<MetricsData>(defaultMetrics);
    const [loading, setLoading] = useState(true); // Carga de las métricas
    const [error, setError] = useState<string | null>(null);

    // ----------------------------------------------------
    // 1. Fetching de Datos (Sincronizado con el Token)
    // ----------------------------------------------------

    useEffect(() => {
        // 🛑 2. CONDICIÓN DE DISPARO DEL FETCH
        // Ejecuta SOLO si:
        // a) El estado de AuthContext ya terminó de cargar (el token está disponible o ausente)
        // b) Es SuperAdmin
        // c) Y hay un token válido (CLAVE para el 401 post-login)
        if (isLoadingAuth || !isSuperAdmin || !token) {
            setLoading(false); // No hay fetch, por lo tanto, la carga de datos es "completa"
            return;
        }

        const fetchMetrics = async () => {
            setLoading(true);
            setError(null);
            try {
                const data: MetricsData = await authFetch("http://localhost:5000/superadmin/metricas", {
                    method: "GET"
                });

                if (data && data.resumenGlobal) {
                    // Si el fetch es exitoso, los datos vienen en camelCase
                    setMetrics(data);
                } else {
                    setMetrics(defaultMetrics); 
                }

            } catch (err: any) {
                console.error("Error al cargar métricas del Superadmin:", err);
                setMetrics(defaultMetrics); 
                // Muestra un mensaje de error más claro, incluyendo el error del 401 si viene de authFetch
                setError(`No se pudieron cargar las métricas. El servidor devolvió un error (401 o 500).`);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    // 🛑 3. DEPENDENCIA CRUCIAL: El token dispara el fetch cuando su valor cambia
    }, [isSuperAdmin, token, isLoadingAuth]); 


    // ----------------------------------------------------
    // 2. Renderizado de Seguridad y Carga
    // ----------------------------------------------------

    // 🛑 4. Bloqueo por la Carga Inicial de Autenticación
    if (isLoadingAuth) {
        return <Spinner />;
    }

    if (!isSuperAdmin) {
        return <div style={{ color: 'red', padding: '20px' }}>
            <h1>❌ Acceso Restringido</h1>
            <p>Solo el Super Admin puede acceder a este panel.</p>
        </div>;
    }

    // 🛑 5. Bloqueo por la Carga de las Métricas
    if (loading) return <Spinner />;
    if (error) return <p style={{ color: 'red', padding: '20px' }}>Error: {error}</p>;

    // 🛑 6. Desestructuración con nombres CORREGIDOS a camelCase
    const { resumenGlobal, tablaPorUsuario } = metrics || defaultMetrics; 
    

    return (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#007bff' }}>🛠️ Panel de Control - Super Administrador</h1>
                <button 
                    onClick={logout} 
                    style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Cerrar Sesión
                </button>
            </div>

            <hr />
            
            {/* ---------------------------------------------------- */}
            <h2>📊 Resumen Global del Sistema</h2>
            {/* ---------------------------------------------------- */}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', backgroundColor: 'white' }}>
                <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                        <th style={tableHeaderStyle}>Métrica</th>
                        <th style={tableHeaderStyle}>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Propiedades en camelCase */}
                    <TableRow label="Usuarios Totales (Activaciones)" value={resumenGlobal.usuariosTotales} isHighlight={true} /> 
                    <TableRow label="Productos Únicos Totales" value={resumenGlobal.productosTotales} />
                    <TableRow label="Total Cajas en Stock" value={resumenGlobal.cajasTotales} />
                    <TableRow label="Total Unidades en Stock" value={resumenGlobal.unidadesTotales} isHighlight={true} />
                    <TableRow 
                        label="Movimientos (Salidas/Egresos) en 30 días" 
                        value={tablaPorUsuario.reduce((acc, user) => acc + user.unidadesEgresadas30d, 0) > 0 ? 'Disponible' : 'No Disponible'} 
                    />
                    <TableRow label="Unidades Totales de Salida (30 días)" value={resumenGlobal.egresosTotales} isHighlight={true} />
                </tbody>
            </table>

            <hr style={{ margin: '30px 0' }} />

            {/* ---------------------------------------------------- */}
            <h2>👥 Métricas Detalladas por Usuario</h2>
            {/* ---------------------------------------------------- */}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', backgroundColor: 'white' }}>
                <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                        <th style={tableHeaderStyle}>Usuario (Email)</th>
                        <th style={tableHeaderStyle}># Productos</th>
                        <th style={tableHeaderStyle}># Cajas</th>
                        <th style={tableHeaderStyle}>Unidades Totales</th>
                        <th style={tableHeaderStyle}>Unidades de Salida (30 días)</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Propiedades en camelCase */}
                    {tablaPorUsuario.map(user => (
                        <tr key={user.userId}>
                            <td style={tableCellStyle}>{user.userName || 'N/A'}</td>
                            <td style={tableCellStyle}>{user.productos}</td>
                            <td style={tableCellStyle}>{user.cajas}</td>
                            <td style={tableCellStyle}>{user.unidades}</td>
                            <td style={{ ...tableCellStyle, fontWeight: user.unidadesEgresadas30d > 0 ? 'bold' : 'normal', color: user.unidadesEgresadas30d > 0 ? '#dc3545' : '#6c757d' }}>
                                {user.unidadesEgresadas30d}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default SuperAdminPanel;

// --- Componentes y Estilos Auxiliares ---

const tableCellStyle: React.CSSProperties = {
    border: '1px solid #dee2e6',
    padding: '10px',
    textAlign: 'center',
};

const tableHeaderStyle: React.CSSProperties = {
    ...tableCellStyle,
    textAlign: 'left',
    fontWeight: 'bold',
    backgroundColor: '#f1f1f1',
};

const TableRow: React.FC<{ label: string, value: string | number, isHighlight?: boolean }> = ({ label, value, isHighlight = false }) => (
    <tr style={{ backgroundColor: isHighlight ? '#fff3cd' : 'white' }}>
        <td style={{ ...tableCellStyle, textAlign: 'left', fontWeight: 'bold' }}>{label}</td>
        <td style={{ ...tableCellStyle, fontWeight: isHighlight ? 'bold' : 'normal', color: isHighlight ? '#007bff' : 'inherit' }}>{value}</td>
    </tr>
);