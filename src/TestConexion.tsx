import { useEffect } from 'react';

function TestConexion() {
  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then(res => {
        if (!res.ok) throw new Error("Respuesta no OK");
        return res.json();
      })
      .then(data => {
        console.log("✅ Conexión exitosa:", data);
      })
      .catch(err => {
        console.error("❌ Error al conectar con backend:", err);
      });
  }, []);

  return <p>Probando conexión con backend...</p>;
}

export default TestConexion;
