import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { authFetch } from './utils/authFetch';

// 📦 Definición de Tipos 
type Movimiento = {
    timestamp: string;
    action: string;
    productCode: string;
    productName: string; 
    delta: number; 
    boxesAfterChange: number;
    unitsPerBox: number;
    batchId: string | null; 
};

type HistorialMovimientosProps = {
    productCode?: string;
};
// ---

function HistorialMovimientos({ productCode }: HistorialMovimientosProps) {
    const [loading, setLoading] = useState(true);
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [filtro, setFiltro] = useState<string | null>(productCode || null); 
    const [error, setError] = useState('');

    // 🔄 Lógica de Carga de Datos
    useEffect(() => {
        setLoading(true);
        setError('');

        // 🛑 CORRECCIÓN: Usar rutas RELATIVAS. authFetch completará la URL base.
        const endpoint = filtro
            ? `/stockmovements?productCode=${filtro}`
            : `/stockmovements`;

        authFetch(endpoint, { method: "GET" })
            .then(res => res.json()) 
            .then((data: Movimiento[]) => {
                if (Array.isArray(data)) {
                    setMovimientos(data);
                } else {
                    setMovimientos([]);
                    setError("La API devolvió un formato de datos inesperado.");
                }
            })
            .catch(err => {
                console.error("Error fetching movimientos:", err);
                setError(`Error al cargar el historial: ${err.message}`);
                setMovimientos([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [filtro]);

    // Lógica de Formato
    const formatDelta = (delta: number, action: string) => {
        // En lugar de usar delta > 0, usamos la acción para mayor claridad
        if (action === 'Ingreso') {
            return `+${delta}`;
        }
        if (action === 'Egreso') {
            // Asumiendo que el delta es un valor absoluto positivo en el backend
            return `-${Math.abs(delta)}`; 
        }
        return delta.toString();
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spinner /><p>Cargando historial de movimientos...</p></div>;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
    }

    if (movimientos.length === 0) {
        return <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>No se encontraron movimientos para {filtro ? `el código ${filtro}` : 'mostrar'}.</div>;
    }

    // Estilos para la tabla
    const tableStyle: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    };

    const thStyle: React.CSSProperties = {
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        textAlign: 'left',
        border: '1px solid #0056b3',
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
            <h2 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Historial de Movimientos de Stock</h2>
            
            {/* Input de Filtro */}
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="productFilter" style={{ marginRight: '10px', fontWeight: 'bold' }}>Filtrar por Código:</label>
                <input
                    id="productFilter"
                    type="text"
                    value={filtro || ''}
                    onChange={(e) => setFiltro(e.target.value)}
                    placeholder="Escriba código de producto (ej: ART-001)"
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '300px' }}
                />
            </div>
            
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={{ ...thStyle, width: '15%' }}>Fecha/Hora</th>
                        <th style={{ ...thStyle, width: '10%', textAlign: 'center' }}>Acción</th>
                        <th style={{ ...thStyle, width: '15%' }}>Código</th>
                        <th style={{ ...thStyle, width: '25%' }}>Nombre Producto</th>
                        <th style={{ ...thStyle, width: '10%', textAlign: 'center' }}>U/Caja</th>
                        <th style={{ ...thStyle, width: '10%', textAlign: 'right' }}>Cajas +/-</th>
                        <th style={{ ...thStyle, width: '15%', textAlign: 'right' }}>Cajas Final</th>
                    </tr>
                </thead>
                <tbody>
                    {movimientos.map((m, index) => {
                        const isEven = index % 2 === 0;
                        const rowStyle: React.CSSProperties = {
                            backgroundColor: isEven ? '#f8f9fa' : 'white',
                            borderBottom: '1px solid #eee'
                        };

                        const deltaValue = formatDelta(m.delta, m.action);
                        
                        return (
                            <tr key={`${m.timestamp}-${m.productCode}-${index}`} style={rowStyle}>
                                <td style={{ padding: '0.5rem', fontSize: '0.9rem', color: '#6c757d' }}>
                                    {new Date(m.timestamp).toLocaleString('es-CL')}
                                </td>
                                <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                                    <span style={{ 
                                        color: m.action === 'Ingreso' ? '#28a745' : '#dc3545', // Verde para ingreso, rojo para egreso
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: m.action === 'Ingreso' ? '#d4edda' : '#f8d7da',
                                        fontSize: '0.8rem'
                                    }}>
                                        {m.action}
                                    </span>
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    {/* Botón/enlace para filtrar por este código específico */}
                                    <button 
                                        onClick={() => setFiltro(m.productCode)}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            textDecoration: 'underline',
                                            color: '#007bff',
                                            cursor: 'pointer',
                                            padding: 0,
                                            fontWeight: '600'
                                        }}
                                    >
                                        {m.productCode}
                                    </button>
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    {m.productName}
                                </td>
                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{m.unitsPerBox}</td>
                                {/* Aplicamos color y espaciado mínimo para las columnas de valores */}
                                <td style={{ 
                                    padding: '0.5rem', 
                                    textAlign: 'right', 
                                    fontWeight: 'bold',
                                    color: m.action === 'Ingreso' ? '#28a745' : '#dc3545' // Verde para ingreso, rojo para egreso
                                }}>
                                    {deltaValue}
                                </td>
                                <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                                    {m.boxesAfterChange}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default HistorialMovimientos;