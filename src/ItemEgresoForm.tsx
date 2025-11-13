import { useState } from 'react';
import { authFetch } from './utils/authFetch';

type Props = {
    onItemUpdated: () => void;
};

function ItemEgresoForm({ onItemUpdated }: Props) {
    const [productCode, setProductCode] = useState('');
    const [unitsPerBox, setUnitsPerBox] = useState(0);
    const [boxesToRemove, setBoxesToRemove] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!productCode.trim()) {
            setErrorMessage("Debes ingresar un código de producto.");
            return;
        }

        if (boxesToRemove < 1 || unitsPerBox < 1) {
            setErrorMessage("Debes ingresar valores válidos (mayores a cero).");
            return;
        }

        const egresoData = {
            productCode,
            boxes: boxesToRemove,
            unitsPerBox
        };

        try {
            const response = await authFetch('/egreso', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(egresoData),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.message || "Error al registrar la salida. Verifique el código y la cantidad.");
                return;
            }

            setErrorMessage(`✅ Salida de ${boxesToRemove} cajas registrada para el producto ${productCode}.`);
            setProductCode('');
            setUnitsPerBox(0);
            setBoxesToRemove(0);
            onItemUpdated();

        } catch (error) {
            console.error("Fallo de red o del servidor:", error);
            setErrorMessage("Error de conexión con el servidor. Intente de nuevo.");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2rem',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderLeft: '5px solid #dc3545'
        }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#dc3545' }}>
                Registro de Salida (Egreso)
            </h2>
            <p style={{ marginBottom: '1rem', color: '#6c757d' }}>Retirar stock de un producto existente.</p>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Código del Producto:</label>
                <input
                    type="text"
                    placeholder="Código (ej: A001)"
                    value={productCode}
                    onChange={e => setProductCode(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Unidades por Caja:</label>
                <input
                    type="number"
                    placeholder="Unidades"
                    value={unitsPerBox}
                    onChange={e => setUnitsPerBox(Number(e.target.value))}
                    required
                    min="1"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Cajas a retirar:</label>
                <input
                    type="number"
                    placeholder="Cantidad de cajas"
                    value={boxesToRemove}
                    onChange={e => setBoxesToRemove(Number(e.target.value))}
                    required
                    min="1"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            <button
                type="submit"
                style={{
                    padding: '0.6rem 1.2rem',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%',
                    fontWeight: 'bold'
                }}
            >
                Registrar Salida del Inventario
            </button>

            {errorMessage && (
                <p style={{ color: errorMessage.startsWith('✅') ? 'green' : 'red', marginTop: '1rem', textAlign: 'center' }}>
                    {errorMessage}
                </p>
            )}
        </form>
    );
}

export default ItemEgresoForm;
