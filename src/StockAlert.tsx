import React, { useState } from 'react';

interface StockAlertProps {
    lowStockItems: { productCode: string; productName: string; boxes: number }[];
}

/**
 * Muestra una alerta persistente con productos que tienen bajo stock (menos de 3 cajas),
 * con opción de desplegar/colapsar la lista.
 */
const StockAlert: React.FC<StockAlertProps> = ({ lowStockItems }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (lowStockItems.length === 0) return null;

    const toggleExpanded = () => setIsExpanded(prev => !prev);

    return (
        <div style={{
            backgroundColor: '#fff3cd',
            color: '#665b54ff',
            border: '1px solid #ffeeba',
            borderRadius: '6px',
            padding: '0.3rem',
            marginBottom: '1.0rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>⚠️ Alerta de stock</strong>
                <button
                    onClick={toggleExpanded}
                    style={{
                        backgroundColor: '#fff3cd',
                        color: '#665b54ff',
                        border: '1px solid #665b54ff',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                    }}
                >
                    {isExpanded ? 'Ocultar' : 'Detalles'}
                </button>
            </div>

            {isExpanded && (
                <ul style={{ marginTop: '0.8rem', paddingLeft: '1.2rem' }}>
                    {lowStockItems.map((item, index) => (
                        <li key={index}>
                            <strong>{item.productCode}</strong> — {item.productName} ({item.boxes} cajas restantes)
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default StockAlert;
