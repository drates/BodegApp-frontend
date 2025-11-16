import { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { authFetch } from './utils/authFetch';

type Movimiento = {
  timestamp: string;
  action: string;
  productCode: string;
  productName: string;
  delta: number;
  boxesAfterChange: number;
  unitsPerBox: number;
  batchId: string | null;
};

function HistorialMovimientos() {
  const [loading, setLoading] = useState(true);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [filtro, setFiltro] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    const endpoint = filtro.trim()
      ? `/api/StockMovements?productCode=${filtro.trim()}`
      : `/api/StockMovements`;

    authFetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("La respuesta no es JSON.");
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setMovimientos(data);
        } else {
          setMovimientos([]);
          setError("La API devolvió un formato de datos inesperado.");
        }
      })
      .catch(err => {
        console.error("Error fetching movimientos:", err);
        setError(`Error al cargar el historial: ${err.message}`);
        setMovimientos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filtro]);

  const formatDelta = (delta: number) => {
    return delta >= 0 ? `+${delta}` : `-${Math.abs(delta)}`;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spinner /><p>Cargando historial de movimientos...</p></div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '0.1rem', marginTop: '-35px' }}>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', marginBottom: '0.8rem', color: '#007bff' }}>
        🔄️ Movimientos recientes
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFiltro(inputCode.trim());
        }}
        style={{ marginBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}
      >
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="Código de producto"
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            flex: '1 1 100px',
            minWidth: '100px'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Buscar
        </button>
      </form>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '320px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#114f92ff', color: 'white' }}>
              <th style={{ fontSize: '0.8rem', padding: '6px', textAlign: 'left' }}>Fecha</th>
              <th style={{ fontSize: '0.8rem', padding: '3px', textAlign: 'center' }}>Acción</th>
              <th style={{ fontSize: '0.8rem', padding: '3px', textAlign: 'left' }}>Código</th>
              <th style={{ fontSize: '0.8rem', padding: '3px', textAlign: 'left' }}>Producto</th>
              <th style={{ fontSize: '0.75rem', padding: '3px', textAlign: 'center' }}>U/Caja</th>
              <th style={{ fontSize: '0.75rem', padding: '10px', textAlign: 'center' }}>Movimiento</th>
              <th style={{ fontSize: '0.75rem', padding: '10px', textAlign: 'center' }}>Stock resultante</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m, index) => {
              const isEven = index % 2 === 0;
              const isEntrada = m.delta >= 0;
              const accionTexto = isEntrada ? 'Entrada' : 'Salida';
              const movimientoTexto = formatDelta(m.delta);

              return (
                <tr key={`${m.timestamp}-${m.productCode}-${index}`} style={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: isEven ? '#f8f9fa' : '#fff'
                }}>
                  <td style={{ fontSize: '0.75rem', padding: '6px', color: '#6c757d' }}>
                    {new Date(m.timestamp).toLocaleString('es-CL')}
                  </td>
                  <td style={{ fontSize: '0.8rem', padding: '3px', textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: isEntrada ? '#cce5ff' : '#114f92',
                      color: isEntrada ? '#000' : '#fff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {accionTexto}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem', padding: '3px' }}>
                    <button
                      onClick={() => setFiltro(m.productCode)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        textAlign: 'center',
                        textDecoration: 'underline',
                        color: '#0664c9ff',
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: '600'
                      }}
                    >
                      {m.productCode}
                    </button>
                  </td>
                  <td style={{ fontSize: '0.8rem', padding: '3px' }}>{m.productName}</td>
                  <td style={{ fontSize: '0.8rem', padding: '3px', textAlign: 'center' }}>{m.unitsPerBox}</td>
                  <td style={{ fontSize: '0.85rem', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                    {movimientoTexto} Caja(s)
                  </td>
                  <td style={{ fontSize: '0.85rem', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                    {m.boxesAfterChange} Caja(s)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {movimientos.length === 0 && (
        <div style={{ marginTop: '20px', textAlign: 'center', color: '#6c757d' }}>
          No se encontraron movimientos para {filtro ? `el código ${filtro}` : 'mostrar'}.
        </div>
      )}
    </div>
  );
}

export default HistorialMovimientos;
