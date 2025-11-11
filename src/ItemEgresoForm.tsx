import { useState } from 'react';
import { authFetch } from './utils/authFetch';
import Spinner from './Spinner'; // Asumo que tienes un Spinner para el estado de carga

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
    
    const [productCode, setProductCode] = useState('');
    const [unitsPerBox, setUnitsPerBox] = useState(0);
    const [boxesToRemove, setBoxesToRemove] = useState(0);
    const [errorMessage, setErrorMessage] = useState(''); // Se usa para feedback de error/éxito
    const [isLoading, setIsLoading] = useState(false); // Estado de carga local

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

        setIsLoading(true);

        try {
            // 🛑 CORRECCIÓN: Usar ruta RELATIVA. authFetch manejará la URL base.
            const response = await authFetch('/egreso', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(egresoData)
            });
            
            // Si llegamos aquí sin que authFetch lance un error, la respuesta es 2xx
            if (response.ok) {
                setErrorMessage(`✅ Egreso de ${boxesToRemove} cajas de ${productCode} registrado con éxito.`);
                // Limpiar campos después de una operación exitosa
                setProductCode('');
                setUnitsPerBox(0);
                setBoxesToRemove(0);
                // Notificar al padre para que recargue ItemList/Historial
                onItemUpdated(); 
            } else {
                 // Si response.ok es false (lo cual authFetch debería haber manejado, pero por si acaso)
                 setErrorMessage("Error desconocido al registrar el egreso.");
            }

        } catch (error: any) {
            // Manejo de errores de red o errores lanzados por authFetch (ej: 400 Bad Request)
            setErrorMessage(`Error al registrar egreso: ${error.message || 'Verifique el código de producto y el stock disponible.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            maxWidth: '600px', 
            margin: '20px auto',
            backgroundColor: '#f8d7da', // Fondo sutil para egreso (rojo claro)
            boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
        }}>
            <h2 style={{ color: '#dc3545', borderBottom: '2px solid #dc3545', paddingBottom: '10px', marginBottom: '20px' }}>
                <span role="img" aria-label="icono-salida" style={{marginRight: '10px'}}>⬇️</span>
                Registrar Egreso (Salida) de Stock
            </h2>
            
            {isLoading && <div style={{ marginBottom: '1rem', color: '#dc3545', fontWeight: 'bold' }}><Spinner /> Registrando salida...</div>}


            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                    Código de Producto:
                </label>
                <input
                    type="text"
                    placeholder="Ej: ART-001"
                    value={productCode}
                    onChange={e => setProductCode(e.target.value)}
                    required
                    style={{ width: '30%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                    Unidades por caja (Requerido para el egreso):
                </label>
                <input
                    type="number"
                    placeholder="Unidades por caja"
                    value={unitsPerBox}
                    onChange={e => setUnitsPerBox(Number(e.target.value))}\
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
                    onChange={e => setBoxesToRemove(Number(e.target.value))}\
                    required
                    style={{ width: '30%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                style={{
                    padding: '0.6rem 1.2rem',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
            >
                {isLoading ? 'Procesando...' : 'Registrar Salida del Inventario'}
            </button>

            {errorMessage && (
                <p style={{ color: errorMessage.startsWith('✅') ? 'green' : 'red', marginTop: '1rem', fontWeight: 'bold' }}>
                    {errorMessage}
                </p>
            )}
        </form>
    );
}

export default ItemEgresoForm;