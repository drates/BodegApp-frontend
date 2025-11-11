import React, { useEffect, useState } from 'react';

interface StockAlertProps {
    message: string;
    isVisible: boolean;
}

/**
 * Muestra un mensaje de alerta temporal (éxito o error) con un diseño simple.
 */
const StockAlert: React.FC<StockAlertProps> = ({ message, isVisible }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
            }, 5000); // Se oculta después de 5 segundos
            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [isVisible, message]);

    if (!show) return null;

    // Determina si es éxito (verde) o error (rojo) basado en el mensaje
    const isSuccess = message.startsWith("✅");
    const backgroundColor = isSuccess ? '#28a745' : '#dc3545'; // verde o rojo
    const borderColor = isSuccess ? '#218838' : '#c82333';

    return (
        <div 
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '15px 25px',
                backgroundColor: backgroundColor,
                color: '#fff',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                fontWeight: 'bold',
                animation: 'fadeIn 0.5s'
            }}
        >
            {message}
        </div>
    );
};

export default StockAlert;