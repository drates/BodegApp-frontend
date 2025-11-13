import React from 'react';

interface StockAlertProps {
    lowStockItems: { productCode: string; productName: string; boxes: number }[];
}

/**
 * Muestra una alerta persistente con productos que tienen bajo stock (menos de 3 cajas).
 */
const StockAlert: React.FC<StockAlertProps> = ({ lowStockItems }) => {
    if (lowStockItems.length === 0) return null;

    return (
        <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeeba',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
            <strong>⚠️ Alerta de stock bajo:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                {lowStockItems.map((item, index) => (
                    <li key={index}>
                        <strong>{item.productCode}</strong> — {item.productName} ({item.boxes} cajas restantes)
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StockAlert;
