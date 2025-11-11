import { useEffect, useState } from 'react';
import { authFetch } from './utils/authFetch'; // ajusta la ruta si es necesario


type Item = {
  id: number;
  name: string;
  boxes: number;
  productCode: string;
};

function StockAlert() {
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);

  useEffect(() => {
  authFetch("/itembatches/alertas")
    .then(res => res.json())
    .then(data => setLowStockItems(data))
    .catch(err => console.error("Error al cargar alertas:", err));
}, []);

  if (lowStockItems.length === 0) return null;

  return (
    <div
      style={{
        marginBottom: '1rem',
        padding: '0.2rem',
        borderRadius: '8px',
        backgroundColor: '#fff8f0',
        border: '1px solid #f5c6cb',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
      }}
    >
      <h5 style={{ color: '#d9534f' }}>
        ⚠️ Alerta: {lowStockItems.length} producto(s) con menos de 3 cajas
      </h5>
      <ul>
        {lowStockItems.map(item => (
          <li key={item.id}>
            <strong>{item.name || item.productCode}</strong> — {item.boxes} cajas
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StockAlert;
