import { useState } from 'react';
import { authFetch } from './utils/authFetch';
import Spinner from './Spinner';

// 🚨 DEFINICIÓN CRÍTICA DE TIPOS: Asegura que onItemCreated sea una función sin argumentos.
type Props = {
    onItemCreated: () => void;
};

// ❌ Lógica de simulación ELIMINADA: Ya no es necesaria, el backend lo maneja.
// const isNewProductCode = (code: string): boolean => {
//     // Por ahora, asumimos que cualquier código que empiece con "sku" ya existe
//     return !code.toLowerCase().startsWith('sku');
// };

function ItemForm({ onItemCreated }: Props) {
    const [productCode, setProductCode] = useState('');
    const [name, setName] = useState('');
    const [boxes, setBoxes] = useState(0);
    const [unitsPerBox, setUnitsPerBox] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!productCode.trim()) {
            setErrorMessage("Debes ingresar un código de producto.");
            return;
        }

        // ❌ VALIDACIÓN DE NOMBRE ELIMINADA: Se delega al backend.
        // if (!name.trim() && isNewProductCode(productCode)) {
        //     setErrorMessage("Debes ingresar un nombre para productos nuevos.");
        //     return;
        // }
        
        if (boxes <= 0 || unitsPerBox <= 0) {
            setErrorMessage("Las cajas y las unidades por caja deben ser mayores a cero.");
            return;
        }

        const newItem = {
            productCode,
            // Envía el nombre, aunque esté vacío. El backend decide si es obligatorio.
            name, 
            boxes,
            unitsPerBox
        };

        setIsLoading(true);

        try {
            const response = await authFetch("/api/ingreso", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem)
            });

            if (response.ok) {
                setProductCode('');
                setName('');
                setBoxes(0);
                setUnitsPerBox(0);
                onItemCreated();
            } else {
                // ✅ CAMBIO CLAVE: Manejo de errores 400 del backend
                if (response.status === 400) {
                    const errorData = await response.json();
                    if (errorData.message) {
                        // Captura el mensaje específico del backend: "El producto es nuevo y requiere un nombre."
                        setErrorMessage(errorData.message); 
                    } else {
                        setErrorMessage("Error de validación de la solicitud.");
                    }
                } else {
                    setErrorMessage("Error desconocido al registrar el ingreso.");
                }
            }

        } catch (error: any) {
            setErrorMessage(`Error al registrar ingreso: ${error.message || 'Error de comunicación con el servidor.'}`);
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
        fontSize: '16px'
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
        backgroundColor: '#0077cc',
        color: '#fff',
        fontSize: '0.85',
        border: 'none',
        borderRadius: '4px',
        cursor: isLoading ? 'not-allowed' : 'pointer'
    };

    return (
        <div>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h2 style={{
                color: '#0077cc',
                borderBottom: '1px solid #cbced0ff',
                paddingBottom: '10px',
                marginBottom: '20px',
                marginTop: '0px',
                fontSize: '1.35rem' 
                }}>
                Registrar Entrada
                </h2>

                {isLoading && <div style={{ marginBottom: '1rem', color: '#007bff', fontWeight: 'bold' }}><Spinner /> Registrando ingreso...</div>}

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

                <div style={inputContainerStyle}>
                    <label style={labelStyle}>Nombre (solo productos nuevos):</label>
                    <input
                        type="text"
                        placeholder="Nombre descriptivo"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={inputElementStyle}
                    />
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ ...inputContainerStyle, flex: 1 }}>
                        <label style={labelStyle}>Cajas a ingresar:</label>
                        <input
                            type="number"
                            placeholder="Cantidad de cajas"
                            value={boxes}
                            onChange={e => setBoxes(Number(e.target.value))}
                            min="1"
                            style={inputElementStyle}
                        />
                    </div>

                    <div style={{ ...inputContainerStyle, flex: 1 }}>
                        <label style={labelStyle}>Unidades por caja:</label>
                        <input
                            type="number"
                            placeholder="Unidades por caja"
                            value={unitsPerBox}
                            onChange={e => setUnitsPerBox(Number(e.target.value))}
                            min="1"
                            style={inputElementStyle}
                        />
                    </div>
                </div>

                <button type="submit" disabled={isLoading} style={submitButtonStyle}>
                    {isLoading ? 'Procesando...' : 'Ingresar Entrada al Inventario'}
                </button>

                {errorMessage && (
                    <p style={{ color: 'red', marginTop: '1rem', fontWeight: 'bold' }}>{errorMessage}</p>
                )}
            </form>
        </div>
    );
}

export default ItemForm;