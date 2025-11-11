import { useState } from 'react';
import { authFetch } from './utils/authFetch';

type Props = {
    onItemUpdated: () => void;
};

// Se mantiene el tipo para buena práctica
type ItemBatch = { 
    id: string;
    productCode: string;
    name: string;
    boxes: number;
    unitsPerBox: number;
};

function ItemEgresoForm({ onItemUpdated }: Props) {
    
    // 🛑 CORRECCIÓN 1: Declaración de Estados (Soluciona el ReferenceError)
    const [productCode, setProductCode] = useState('');
    const [unitsPerBox, setUnitsPerBox] = useState(0);
    const [boxesToRemove, setBoxesToRemove] = useState(0);
    const [errorMessage, setErrorMessage] = useState(''); // Se usa para feedback de error/éxito

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(''); // Limpiamos el error previo

        if (boxesToRemove < 1 || unitsPerBox < 1) {
            setErrorMessage("Debes ingresar valores válidos (mayores a cero).");
            return;
        }

        const egresoData = {
            productCode: productCode,
            boxes: boxesToRemove,
            unitsPerBox: unitsPerBox 
        };

        try {
            // authFetch ahora devuelve el objeto Response completo (Status 200 o 4xx/5xx)
            const egresoRes = await authFetch("/egreso", {
                method: "POST",
                // ¡Importante! authFetch ya pone Content-Type: application/json en los headers,
                // pero lo dejamos por si acaso, aunque ya no es necesario aquí
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify(egresoData)
            });

            // 🛑 NOTA: Con la versión corregida de authFetch, este if no es necesario
            // ya que authFetch lanza un error para 4xx/5xx, mandándonos al catch.
            // Pero lo dejamos por si la lógica de authFetch cambia.
            if (!egresoRes.ok) {
                // Si llegamos aquí, algo raro pasó; lanzamos un error para ir al catch
                throw new Error(`Error ${egresoRes.status}: Error al procesar la salida.`);
            }

            // ✅ CORRECCIÓN 2: Consumir la respuesta
            // Esto es CRUCIAL. Evita el error "fantasma" que ocurría después del éxito.
            // Si el backend no devuelve un cuerpo, usamos .text() para vaciar el stream.
            await egresoRes.text(); 
            
            // 3. Limpiar formulario y dar feedback
            setProductCode('');
            setUnitsPerBox(0);
            setBoxesToRemove(0);
            setErrorMessage("✅ Salida registrada exitosamente."); 

            // 4. Notificar a Home.tsx para recargar las vistas
            onItemUpdated(); 
            
        } catch (err: any) {
            // Este bloque atrapa: 
            // a) Errores lanzados por authFetch (con mensajes limpios como "Stock insuficiente").
            // b) Fallos de red.
            const message = err.message || "Error desconocido. Por favor, revise la consola.";
            console.error("Fallo en la operación de egreso:", err);
            setErrorMessage(`🚨 ${message}`);
        }
    };

    return (
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
            <h3 style={{ marginBottom: '1rem' }}>Registro de Salidas</h3>

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
                    style={{ width: '95%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
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

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                    Cajas a retirar:
                </label>
                <input
                    type="number"
                    placeholder="Cantidad de cajas"
                    value={boxesToRemove}
                    onChange={e => setBoxesToRemove(Number(e.target.value))}
                    required
                    style={{ width: '30%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
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
                    cursor: 'pointer'
                }}
            >
                Registrar Salida del Inventario
            </button>

            {errorMessage && (
                <p style={{ color: errorMessage.startsWith('✅') ? 'green' : 'red', marginTop: '1rem' }}>
                    {errorMessage}
                </p>
            )}
        </form>
    );
}

export default ItemEgresoForm;