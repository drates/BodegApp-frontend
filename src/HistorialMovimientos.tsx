import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { authFetch } from './utils/authFetch';

// 📦 Definición de Tipos (Sin cambios)
// ---
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

    // 🔄 Lógica de Carga de Datos (Sin cambios)
    useEffect(() => {
        setLoading(true);
        setError('');

        const endpoint = filtro
            ? `/stockmovements?productCode=${filtro}`
            : `/stockmovements`;

        authFetch(endpoint, { method: "GET" })
            .then(res => res.json()) 
            .then((data: Movimiento[]) => {
                setMovimientos(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar historial:", err);
                setError("No se pudo cargar el historial de movimientos. Revise la sesión.");
                setLoading(false);
            });
    }, [filtro]);

    // ⚙️ Handlers (Sin cambios)
    const handleProductFilterClick = (code: string) => {
        setFiltro(filtro === code ? null : code);
    };

    // 🛑 Estados de Carga/Error/Vacío (Sin cambios)
    if (loading) return <Spinner />;
    if (error) return <p style={{ color: 'red', padding: '1rem' }}>{error}</p>;
    if (movimientos.length === 0) return <p style={{ padding: '1rem' }}>No hay movimientos registrados.</p>;

    // 📊 Renderizado de la Tabla
    return (
        // 1. Contenedor más minimalista: quitamos fondo y sombra, y reducimos padding
        <div style={{
            marginBottom: '1.5rem',
            padding: '0.5rem 0', // Reducimos el padding vertical del div contenedor
            overflowX: 'auto'
        }}>
            {/* 2. Título más compacto */}
            <h3 style={{ 
                marginBottom: '0.75rem', 
                fontSize: '1.25rem' 
            }}>
              🔄️ Historial de Movimientos {filtro ? `— **${filtro}**` : ''}
            </h3>
            
            {/* 3. Estilo de tabla Bootstrap-like */}
            <table style={{ 
                minWidth: '700px', // Reducimos el minWidth
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '0.85rem', // Fuente un poco más pequeña
                border: '1px solid #dee2e6' // Borde sutil a la tabla completa
            }}>
                {/* Encabezado */}
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        {/* Reducimos el padding en los th a 0.5rem */}
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Fecha</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Acción</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Código</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Nombre</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>U/Caja</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Cajas</th> {/* Etiqueta más corta */}
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Stock Final</th> {/* Etiqueta más corta */}
                    </tr>
                </thead>
                {/* Cuerpo de la tabla */}
                <tbody>
                    {movimientos.map((m, index) => {
                        const actionText = m.action.toUpperCase();
                        const deltaValue = m.delta > 0 ? `+${m.delta}` : m.delta; // Muestra el signo para entradas
                        
                        // Determinar color de la fila para minimalismo
                        const rowColor = m.action.toLowerCase() === 'ingreso' ? 'rgba(40, 167, 69, 0.05)' : 
                                         m.action.toLowerCase() === 'egreso' ? 'rgba(220, 53, 69, 0.05)' : 
                                         'transparent';


                        return (
                            <tr 
                                key={index} 
                                style={{ 
                                    borderBottom: '1px solid #f2f2f2', // Borde sutil entre filas
                                    backgroundColor: rowColor // Color sutil basado en la acción
                                }}
                            >
                                {/* Reducimos el padding en los td a 0.5rem y usamos color sutil en la fecha */}
                                <td style={{ padding: '0.5rem', color: '#6c757d' }}>{new Date(m.timestamp).toLocaleString()}</td>
                                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>
                                    {actionText}
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    <button
                                        onClick={() => handleProductFilterClick(m.productCode)}
                                        style={{
                                            background: filtro === m.productCode ? '#e9ecef' : 'transparent', // Fondo más suave para el filtro
                                            border: 'none',
                                            color: '#007bff',
                                            textDecoration: 'none', // Quitamos el subrayado
                                            cursor: 'pointer',
                                            padding: '0.1rem 0.3rem', // Padding mínimo
                                            borderRadius: '3px',
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
                                    color: m.delta > 0 ? '#28a745' : '#dc3545' // Verde para ingreso, rojo para egreso
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