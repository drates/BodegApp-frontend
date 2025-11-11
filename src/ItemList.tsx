import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { authFetch } from './utils/authFetch';

// 📦 Definición de Tipos (Sin cambios)
// ---
type ItemBatch = {
    id: string; 
    name: string;
    productCode: string;
    boxes: number;
    unitsPerBox: number;
    totalUnits: number; // Asumo que este campo también existe en el DTO de C#
};

function ItemList() {
    const [batches, setBatches] = useState<ItemBatch[]>([]);
    type SortableKeys = keyof ItemBatch | 'TotalUnits'; 
    const [sortBy, setSortBy] = useState<SortableKeys | null>(null); 
    const [sortAsc, setSortAsc] = useState<boolean>(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); 

    // 🔄 Lógica de Carga de Datos (Sin cambios)
    useEffect(() => {
        setLoading(true);
        setError('');

        authFetch("/itembatches", {
            method: "GET" 
        })
        .then(res => res.json()) 
        .then((data: ItemBatch[]) => {
            if (Array.isArray(data)) {
                setBatches(data);
            } else {
                setBatches([]);
                setError("La API devolvió un formato incorrecto para el inventario.");
            }
        })
        .catch(err => {
            console.error("Error al cargar inventario:", err);
            setError("Error al cargar el inventario. Revise la conexión o la sesión.");
            setBatches([]);
        })
        .finally(() => {
            setLoading(false);
        });

    }, []);

    // ⚙️ Handlers de Ordenamiento (Sin cambios funcionales)
    const handleSort = (key: SortableKeys) => {
        setSortAsc(sortBy === key ? !sortAsc : true);
        setSortBy(key);
    };

    // 📝 Lógica de Ordenamiento (Sin cambios funcionales)
    const sortedBatches = [...batches].sort((a, b) => {
        if (!sortBy) return 0;
        
        let valA: string | number;
        let valB: string | number;

        if (sortBy === 'TotalUnits') {
            valA = (a.boxes ?? 0) * (a.unitsPerBox ?? 0);
            valB = (b.boxes ?? 0) * (b.unitsPerBox ?? 0);
        } else {
            valA = (a[sortBy as keyof ItemBatch] ?? '').toString().toLowerCase();
            valB = (b[sortBy as keyof ItemBatch] ?? '').toString().toLowerCase();
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortAsc ? valA - valB : valB - valA;
        } else {
            return sortAsc ? valA.toString().localeCompare(valB.toString()) : valB.toString().localeCompare(valA.toString());
        }
    });

    // 🛑 Estados de Carga/Error/Vacío (Sin cambios)
    if (loading) return <Spinner />;
    if (error) return <p style={{ color: 'red', padding: '1rem' }}>❌ Error: {error}</p>;
    if (batches.length === 0) return <p>El inventario está vacío. Use "Ingreso de Entradas" para comenzar.</p>;

    // 📊 Renderizado de la Tabla - Estilo Minimalista
    return (
        <div style={{ padding: '0.5rem 0', overflowX: 'auto' }}>
            {/* Título compacto */}
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>
                📦 Inventario por Lote
            </h3>
            
            {/* Estilo de tabla minimalista (Bootstrap-like) */}
            <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '0.9rem',
                border: '1px solid #dee2e6', // Borde general sutil
                marginBottom: '1rem'
            }}>
                {/* Encabezado */}
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}> {/* Fondo muy claro */}
                        
                        {/* Estilos para TH: padding reducido, sin bordes laterales */}
                        {
                            ['name', 'productCode', 'boxes', 'unitsPerBox', 'TotalUnits'].map((key) => {
                                const isSortable = ['name', 'productCode', 'TotalUnits'].includes(key);
                                const currentKey = key as SortableKeys;
                                const headerText = key === 'name' ? 'Nombre' : 
                                                   key === 'productCode' ? 'Código' : 
                                                   key === 'boxes' ? 'Cajas' :
                                                   key === 'unitsPerBox' ? 'U/Caja' : 'Total Unidades';

                                const textAlign = ['boxes', 'unitsPerBox', 'TotalUnits'].includes(key) ? 'center' : 'left';
                                
                                const thStyle = {
                                    padding: '0.5rem',
                                    textAlign: textAlign as React.CSSProperties['textAlign'],
                                    borderBottom: '2px solid #dee2e6', // Borde separador
                                    border: 'none', // Quitamos bordes internos
                                };
                                
                                if (isSortable) {
                                    return (
                                        <th key={key} style={thStyle}>
                                            <button 
                                                onClick={() => handleSort(currentKey)} 
                                                style={{ 
                                                    border: 'none', 
                                                    background: 'none', 
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    color: '#343a40'
                                                }}
                                            >
                                                {headerText} {sortBy === currentKey ? (sortAsc ? '▲' : '▼') : ''}
                                            </button>
                                        </th>
                                    );
                                } else {
                                    return (
                                        <th key={key} style={{ ...thStyle, fontWeight: 'bold', color: '#343a40' }}>
                                            {headerText}
                                        </th>
                                    );
                                }
                            })
                        }
                    </tr>
                </thead>
                {/* Cuerpo de la tabla */}
                <tbody>
                    {sortedBatches.map((batch, index) => {
                        const totalUnits = (batch.boxes ?? 0) * (batch.unitsPerBox ?? 0);
                        const isLastRow = index === sortedBatches.length - 1;

                        const tdStyle: React.CSSProperties = {
                            padding: '0.5rem',
                            border: 'none', // Quitamos bordes internos
                            borderBottom: isLastRow ? 'none' : '1px solid #f2f2f2', // Borde sutil entre filas
                        };

                        return (
                            <tr key={batch.id}>
                                {/* Nombre */}
                                <td style={{ ...tdStyle, fontWeight: '600' }}>{batch.name}</td>
                                
                                {/* Código */}
                                <td style={{ ...tdStyle, color: '#6c757d' }}>{batch.productCode}</td>
                                
                                {/* Cajas */}
                                <td style={{ ...tdStyle, textAlign: 'center' }}>{batch.boxes}</td>
                                
                                {/* U/Caja */}
                                <td style={{ ...tdStyle, textAlign: 'center' }}>{batch.unitsPerBox}</td>
                                
                                {/* Total Unidades (Destacado) */}
                                <td style={{ 
                                    ...tdStyle, 
                                    textAlign: 'center', 
                                    fontWeight: 'bold',
                                    backgroundColor: '#e9ecef' // Un fondo muy sutil para la columna de valor
                                }}>
                                    {totalUnits}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default ItemList;