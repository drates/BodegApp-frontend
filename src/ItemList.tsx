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

function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'productCode'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [inputCode, setInputCode] = useState('');
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authFetch('/items', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Error al cargar el inventario.");
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

    fetchItems();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFiltro(inputCode.trim().toLowerCase());
    }, 1500);

    return () => clearTimeout(handler);
  }, [inputCode]);

  const handleSort = (field: 'name' | 'productCode') => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const filteredItems = filtro
    ? items.filter(item =>
        item.productCode.toLowerCase().includes(filtro) ||
        item.name.toLowerCase().includes(filtro)
      )
    : items;

  const sortedItems = [...filteredItems].sort((a, b) => {
    const fieldA = a[sortBy].toLowerCase();
    const fieldB = b[sortBy].toLowerCase();
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '0.1rem', marginTop: '-35px' }}>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', marginBottom: '0.8rem', color: '#007bff' }}>
        📦 Inventario
      </h2>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        //marginBottom: '10px',
        maxWidth: '230px',
        flexWrap: 'nowrap'
      }}>
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="Filtrar por Código o Nombre"
          style={{
            flex: '1',
            padding: '4px 6px',
            fontSize: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        {filtro && (
          <button
            type="button"
            onClick={() => {
              setFiltro('');
              setInputCode('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: 0
            }}
          >
            Quitar filtro
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '250px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#114f92ff', color: 'white', height: '50px' }}>
              <th
                style={{ fontSize: '0.8rem', padding: '6px', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => handleSort('productCode')}
              >
                <u>Código</u> {sortBy === 'productCode' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th
                style={{ fontSize: '0.8rem', padding: '3px', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => handleSort('name')}
              >
                <u>Nombre</u> {sortBy === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th style={{ fontSize: '0.8rem', padding: '3px', textAlign: 'right' }}>Cajas</th>
              <th style={{ fontSize: '0.75rem', padding: '3px', textAlign: 'right' }}>U/Caja</th>
              <th style={{ fontSize: '0.73rem', padding: '6px', textAlign: 'right' }}>Unidades</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map(item => (
              <tr key={item.id} style={{
                borderBottom: '1px solid #eee',
                backgroundColor: item.boxes === 0 ? '#ffdddd' : '#fff',
                height: '35px',
                transition: 'background-color 0.2s'
              }}>
                <td style={{ fontSize: '0.9rem', padding: '3px' }}>{item.productCode}</td>
                <td style={{ fontSize: '0.8rem', padding: '3px' }}>{item.name}</td>
                <td style={{ fontSize: '0.9rem', padding: '3px', textAlign: 'right', fontWeight: 'bold' }}>{item.boxes}</td>
                <td style={{ fontSize: '0.9rem', padding: '3px', textAlign: 'right' }}>{item.unitsPerBox}</td>
                <td style={{ fontSize: '0.9rem', padding: '6px', textAlign: 'right', color: item.totalUnits === 0 ? 'red' : 'inherit' }}>{item.totalUnits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedItems.length === 0 && (
        <div style={{ marginTop: '20px', textAlign: 'center', color: '#6c757d' }}>
          No se encontraron resultados.
        </div>
      )}
    </div>
  );
}

export default ItemList;
