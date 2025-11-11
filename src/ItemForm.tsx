import { useState } from 'react';
import { authFetch } from './utils/authFetch';

type Props = {
    onItemCreated: () => void;
};

function ItemForm({ onItemCreated }: Props) {
    const [productCode, setProductCode] = useState('');
    const [name, setName] = useState('');
    const [boxes, setBoxes] = useState(0);
    const [unitsPerBox, setUnitsPerBox] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        // Validación simple para evitar enviar 0 si el usuario no tocó los campos
        if (boxes <= 0 || unitsPerBox <= 0) {
            setErrorMessage("Las cajas y las unidades por caja deben ser mayores a cero.");
            return;
        }

        const newItem = {
            productCode,
            name,
            boxes,
            unitsPerBox
        };

        try {
            console.log("Enviando a /ingreso:", newItem);

            // 1. Ejecutar el POST de Ingreso
            await authFetch("http://localhost:5000/ingreso", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem)
            });
            
            // 🚨 ELIMINACIÓN CRÍTICA: Se eliminó la doble llamada GET a /itembatches 
            // y la línea localStorage.setItem("cachedInventory", ...)
            
            // 2. Limpiar formulario
            setProductCode('');
            setName('');
            setBoxes(0);
            setUnitsPerBox(0);

            // 3. Notificar a Home.tsx para que recargue ItemList y HistorialMovimientos
            onItemCreated(); 

        } catch (err: any) {
            console.error("Error de red o servidor:", err);
            const msg = err.message || "";
            if (msg.includes("nombre del producto")) {
                setErrorMessage("Este producto no existe en nuestra base de datos. Por favor agregue un nombre del producto para ingresar la entrada.");
            } else {
                setErrorMessage("Error al ingresar el producto.");
            }
        }
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                style={{
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e0e0e0'
                }}
            >
                <h3 style={{ marginBottom: '1rem' }}>Ingreso de Entradas</h3>

                {/* Código de formulario sin cambios */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Código del Producto:
                    </label>
                    <input
                        type="text"
                        placeholder="Código del producto"
                        value={productCode}
                        onChange={e => setProductCode(e.target.value)}
                        required
                        style={{ width: '70%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Nombre del Producto (opcional si ya existe):
                    </label>
                    <input
                        type="text"
                        placeholder="Nombre del producto"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{ width: '70%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Cajas:
                    </label>
                    <input
                        type="number"
                        placeholder="Cajas"
                        value={boxes}
                        onChange={e => setBoxes(Number(e.target.value))}
                        required
                        style={{ width: '30%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Unidades por caja:
                    </label>
                    <input
                        type="number"
                        placeholder="Unidades por caja"
                        value={unitsPerBox}
                        onChange={e => setUnitsPerBox(Number(e.target.value))}
                        required
                        style={{ width: '30%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        padding: '0.6rem 1.2rem',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Ingresar Entrada al Inventario
                </button>

                {errorMessage && (
                    <p style={{ color: 'red', marginTop: '1rem' }}>{errorMessage}</p>
                )}
            </form>
        </div>
    );
}

export default ItemForm;