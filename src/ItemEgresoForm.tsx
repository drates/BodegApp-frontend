import { useState } from 'react';
import { authFetch } from './utils/authFetch';
import Spinner from './Spinner';

type Props = {
    onItemUpdated: () => void;
};

function ItemEgresoForm({ onItemUpdated }: Props) {
    const [productCode, setProductCode] = useState('');
    const [unitsPerBox, setUnitsPerBox] = useState(0);
    const [boxesToRemove, setBoxesToRemove] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

        setIsLoading(true);

        try {
            const response = await authFetch('/api/egreso', {
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
        } finally {
            setIsLoading(false);
        }
    };

    const formStyle: React.CSSProperties = {
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '10px auto',
        textAlign: 'left',
        backgroundColor: '#ffffffff',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
    };

    const inputContainerStyle: React.CSSProperties = {
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '0.25rem',
        fontSize: '15px'
    };

    const inputElementStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.3rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        boxSizing: 'border-box'
    };

    const submitButtonStyle: React.CSSProperties = {
        padding: '0.6rem 1.2rem',
        backgroundColor: '#0466C9',
        color: '#fff',
        border: 'none',
        fontSize: '1',
        borderRadius: '15px',
        cursor: isLoading ? 'not-allowed' : 'pointer'
    };

    return (
        <div>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h2 style={{
                    color: '#0466C9',
                    borderBottom: '1px solid #cbced0ff',
                    paddingBottom: '10px',
                    marginBottom: '20px',
                    marginTop: '0px',
                    fontSize: '1.35rem'
                }}>
                    Registrar Salida
                </h2>

                {isLoading && <div style={{ marginBottom: '1rem', color: '#0466C9', fontWeight: 'bold' }}><Spinner /> Registrando salida...</div>}

                <div style={inputContainerStyle}>
                    <label style={labelStyle}>Código del Producto:</label>
                    <input
                        type="text"
                        placeholder="Ej: ART-001"
                        value={productCode}
                        onChange={e => setProductCode(e.target.value)}
                        style={inputElementStyle}
                    />
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ ...inputContainerStyle, flex: 1 }}>
                        <label style={labelStyle}>Unid. por caja:</label>
                        <input
                            type="number"
                            placeholder="Unidades"
                            value={unitsPerBox}
                            onChange={e => setUnitsPerBox(Number(e.target.value))}
                            min="1"
                            style={inputElementStyle}
                        />
                    </div>

                    <div style={{ ...inputContainerStyle, flex: 1 }}>
                        <label style={labelStyle}>Cajas a retirar:</label>
                        <input
                            type="number"
                            placeholder="Cantidad de cajas"
                            value={boxesToRemove}
                            onChange={e => setBoxesToRemove(Number(e.target.value))}
                            min="1"
                            style={inputElementStyle}
                        />
                    </div>
                </div>

                <button type="submit" disabled={isLoading} style={submitButtonStyle}>
                    {isLoading ? 'Procesando...' : 'Registrar Salida del Inventario'}
                </button>

                {errorMessage && (
                    <p style={{
                        color: errorMessage.startsWith('✅') ? 'green' : 'red',
                        marginTop: '1rem',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        {errorMessage}
                    </p>
                )}
            </form>
        </div>
    );
}

export default ItemEgresoForm;
