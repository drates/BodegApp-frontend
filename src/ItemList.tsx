import { useState, useEffect } from 'react';
import { authFetch } from './utils/authFetch';
import Spinner from './Spinner';

type Item = {
    id: string;
    productCode: string;
    name: string;
    description: string;
    boxes: number;
    unitsPerBox: number;
    totalUnits: number;
    lastMovement: string;
};

type ItemBatch = Item;

function ItemList() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<ItemBatch | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await authFetch('/items', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError("Sesión expirada. Por favor, inicie sesión nuevamente.");
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || "Error al cargar el inventario.");
                }
                return;
            }

            const data: Item[] = await response.json();
            setItems(data);

        } catch (err) {
            console.error("Fallo de red al obtener ítems:", err);
            setError("Fallo de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleEditClick = (item: ItemBatch) => {
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const filteredItems = items.filter(item =>
        item.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#007bff' }}>
                Inventario Actual
            </h2>

            <div style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Buscar por código o nombre..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}
                />
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '700px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Código</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Descripción</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Cajas</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Unidades/Caja</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Total Unidades</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Último Movimiento</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee', backgroundColor: item.boxes === 0 ? '#ffdddd' : '#fff', transition: 'background-color 0.2s' }}>
                                <td style={{ padding: '12px' }}>{item.productCode}</td>
                                <td style={{ padding: '12px' }}>{item.name}</td>
                                <td style={{ padding: '12px', fontSize: '0.9em' }}>{item.description}</td>
                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{item.boxes}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>{item.unitsPerBox}</td>
                                <td style={{ padding: '12px', textAlign: 'right', color: item.totalUnits === 0 ? 'red' : 'inherit' }}>{item.totalUnits}</td>
                                <td style={{ padding: '12px', fontSize: '0.85em' }}>{item.lastMovement ? new Date(item.lastMovement).toLocaleString() : 'N/A'}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleEditClick(item)}
                                        style={{
                                            backgroundColor: '#ffc107',
                                            color: '#333',
                                            border: 'none',
                                            padding: '6px 10px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredItems.length === 0 && !loading && (
                <div style={{ marginTop: '20px', textAlign: 'center', color: '#6c757d' }}>
                    No se encontraron ítems en el inventario que coincidan con la búsqueda.
                </div>
            )}

            {isModalOpen && itemToEdit && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        maxWidth: '90%',
                        width: '500px',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
                    }}>
                        {/* Modal content goes here */}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ItemList;
