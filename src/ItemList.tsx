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
        <div style={{ padding: '0.1rem', marginTop: '-35px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.8rem', color: '#007bff' }}>
                📦Inventario
            </h2>

            <div style={{ marginBottom: '0.2rem' }}>
                <input
                    type="text"
                    placeholder="Buscar por código o nombre..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                        width: '80%',
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
                    minWidth: '290px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                            <th style={{ fontSize: '0.80rem', padding: '6px', textAlign: 'left' }}>Código</th>
                            <th style={{ fontSize: '0.80rem', padding: '6px', textAlign: 'left' }}>Nombre</th>
                            <th style={{ fontSize: '0.80rem', padding: '6px', textAlign: 'right' }}>Cajas</th>
                            <th style={{ fontSize: '0.75rem', padding: '6px', textAlign: 'right' }}>Unidades por Caja</th>
                            <th style={{ fontSize: '0.75rem', padding: '6px', textAlign: 'right' }}>Total Unidades</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee', backgroundColor: item.boxes === 0 ? '#ffdddd' : '#fff', transition: 'background-color 0.2s' }}>
                                <td style={{ fontSize: '0.9rem', padding: '6px' }}>{item.productCode}</td>
                                <td style={{ fontSize: '0.8rem', padding: '6px' }}>{item.name}</td>
                                <td style={{ fontSize: '0.9rem', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{item.boxes}</td>
                                <td style={{ fontSize: '0.9rem', padding: '6px', textAlign: 'right' }}>{item.unitsPerBox}</td>
                                <td style={{ fontSize: '0.9rem', padding: '6px', textAlign: 'right', color: item.totalUnits === 0 ? 'red' : 'inherit' }}>{item.totalUnits}</td>
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
                        padding: '10px',
                        borderRadius: '10px',
                        maxWidth: '95%',
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
