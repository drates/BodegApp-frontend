import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { authFetch } from './utils/authFetch';
import EditItemForm from './EditItemForm'; // Asumo que el componente existe

// 📦 Definición de Tipos
// ---
type ItemBatch = {
    id: string; 
    name: string;
    productCode: string;
    boxes: number;
    unitsPerBox: number;
    totalUnits: number; 
};

type SortableKeys = 'name' | 'productCode' | 'boxes' | 'unitsPerBox' | 'totalUnits'; 
// ---

function ItemList() {
    const [batches, setBatches] = useState<ItemBatch[]>([]);
    const [sortBy, setSortBy] = useState<SortableKeys | null>('name'); // Ordenar por nombre por defecto
    const [sortAsc, setSortAsc] = useState<boolean>(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); 
    const [itemToEdit, setItemToEdit] = useState<ItemBatch | null>(null); // Estado para la edición

    // 🔄 Lógica de Carga de Datos
    const fetchBatches = () => {
        setLoading(true);
        setError('');
        
        // 🛑 CORRECCIÓN: Usar ruta RELATIVA. authFetch completará la URL base.
        authFetch("/itembatches", {
            method: "GET" 
        })
        .then(res => res.json()) 
        .then((data: ItemBatch[]) => {
            if (Array.isArray(data)) {
                // Aquí el backend debería devolver la suma de lotes por item.
                // Si devuelve lotes individuales, necesitaremos agruparlos aquí o asumir 
                // que el backend ya hace la agrupación a nivel de productCode. 
                // Asumiremos que 'itembatches' devuelve el inventario consolidado.
                setBatches(data);
            } else {
                setBatches([]);
                setError("La API devolvió un formato de datos inesperado.");
            }
        })
        .catch(err => {
            console.error("Error fetching item batches:", err);
            setError(`Error al cargar el inventario: ${err.message}`);
            setBatches([]);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchBatches();
    }, []); // Se ejecuta solo al montar

    // Lógica de Ordenamiento
    const handleSort = (key: SortableKeys) => {
        if (sortBy === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortBy(key);
            setSortAsc(true);
        }
    };

    const sortedBatches = [...batches].sort((a, b) => {
        if (!sortBy) return 0;
        
        // Manejar el caso de 'totalUnits' si no viene directo del DTO
        const aValue = sortBy === 'totalUnits' ? a.boxes * a.unitsPerBox : a[sortBy];
        const bValue = sortBy === 'totalUnits' ? b.boxes * b.unitsPerBox : b[sortBy];

        if (aValue < bValue) return sortAsc ? -1 : 1;
        if (aValue > bValue) return sortAsc ? 1 : -1;
        return 0;
    });

    // Estilo para los headers de la tabla
    const thStyle: React.CSSProperties = {
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        textAlign: 'left',
        cursor: 'pointer',
        border: '1px solid #0056b3',
    };
    
    const tdStyle: React.CSSProperties = {
        padding: '10px',
        borderBottom: '1px solid #eee',
    };

    // Helper para el indicador de ordenamiento
    const sortIndicator = (key: SortableKeys) => {
        if (sortBy !== key) return null;
        return sortAsc ? ' 🔼' : ' 🔽';
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spinner /><p>Cargando inventario...</p></div>;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
    }
    
    // Si estamos editando, mostramos el formulario de edición
    if (itemToEdit) {
        return (
            <EditItemForm 
                item={itemToEdit} 
                onCancel={() => setItemToEdit(null)} 
                onItemUpdated={() => { 
                    setItemToEdit(null); 
                    fetchBatches(); // Recargar datos después de la actualización
                }} 
            />
        );
    }


    return (
        <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
            <h2 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Inventario Consolidado</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <thead>
                    <tr>
                        <th style={thStyle} onClick={() => handleSort('name')}>
                            Nombre {sortIndicator('name')}
                        </th>
                        <th style={thStyle} onClick={() => handleSort('productCode')}>
                            Código {sortIndicator('productCode')}
                        </th>
                        <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => handleSort('boxes')}>
                            Cajas {sortIndicator('boxes')}
                        </th>
                        <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => handleSort('unitsPerBox')}>
                            U/Caja {sortIndicator('unitsPerBox')}
                        </th>
                        <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => handleSort('totalUnits')}>
                            Total Unidades {sortIndicator('totalUnits')}
                        </th>
                        <th style={{ ...thStyle, width: '10%', textAlign: 'center' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedBatches.map((batch, index) => {
                        const isEven = index % 2 === 0;
                        const rowStyle: React.CSSProperties = {
                            backgroundColor: isEven ? '#f8f9fa' : 'white',
                            cursor: 'pointer',
                        };

                        const totalUnits = batch.boxes * batch.unitsPerBox;

                        return (
                            <tr key={batch.id} style={rowStyle} onDoubleClick={() => setItemToEdit(batch)}>
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
                                
                                {/* Botón de Acción */}
                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                    <button
                                        onClick={() => setItemToEdit(batch)}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#ffc107',
                                            color: '#333',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Editar
                                    </button>
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