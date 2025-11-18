import React from 'react';

const DocumentosLegales = () => {
    // Estilo base para consistencia
    const containerStyle: React.CSSProperties = {
        maxWidth: '900px',
        margin: '50px auto',
        padding: '20px 30px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.7',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    };

    const sectionStyle: React.CSSProperties = {
        marginBottom: '40px',
        paddingTop: '20px', // Espacio para el ancla
        borderBottom: '1px solid #ddd',
    };

    const titleStyle: React.CSSProperties = {
        color: '#0466C9',
        borderBottom: '2px solid #ccc',
        paddingBottom: '10px',
        marginBottom: '20px',
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>Documentos Legales de BodegaFeliz</h1>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                Última actualización: 18 de Noviembre de 2025. Utiliza el menú de navegación para ir a la sección de tu interés.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '40px', padding: '10px', backgroundColor: '#eef' }}>
                <a href="#terminos" style={{ color: '#0466C9', textDecoration: 'none', fontWeight: 'bold' }}>
                    Términos y Condiciones
                </a>
                <a href="#privacidad" style={{ color: '#0466C9', textDecoration: 'none', fontWeight: 'bold' }}>
                    Política de Privacidad
                </a>
            </div>
            
            <hr />

            {/* --- SECCIÓN 1: TÉRMINOS Y CONDICIONES --- */}
            <section id="terminos" style={sectionStyle}>
                <h2 style={titleStyle}>Términos y Condiciones de Uso</h2>
                
                <p>
                    BodegaFeliz está en **versión beta de prueba**, por lo que **no se garantiza ninguna funcionalidad** ni registro de datos persistente.
                </p>

                <p>
                    BodegaFeliz tiene los datos respaldados en la nube, pero **no se hace responsable de su disponibilidad ni almacenaje**. Se asume que usuarios deben manejar un respaldo de información en caso de contingencia.
                </p>

                <p>
                    BodegaFeliz se reserva el derecho de hacer cambios, suspender cuentas, y tomar cualquier medida con la aplicación y datos, a discreción propia y dentro de los marcos legales respectivos.
                </p>

                <p>
                    Los términos y condiciones pueden **cambiar sin previo aviso**.
                </p>

                <p style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                    <a href="#top" style={{ color: '#888' }}>[Ir arriba]</a>
                </p>
            </section>

            {/* --- SECCIÓN 2: POLÍTICA DE PRIVACIDAD --- */}
            <section id="privacidad" style={sectionStyle}>
                <h2 style={titleStyle}>Política de Privacidad</h2>
                
                <p>
                    Los datos ingresados por usuarios a BodegaFeliz **no serán compartidos con terceras partes**, a menos que sea por requisito legal.
                </p>

                <p>
                    Los datos serán usados para disponer el funcionamiento de las herramientas al usuario, así como para **identificar oportunidades de mejora de la aplicación**.
                </p>
                
                <p>
                    Los datos pueden ser usados de forma **agregada y anonimizada** para otros fines.
                </p>
                
                <p style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                    <a href="#top" style={{ color: '#888' }}>[Ir arriba]</a>
                </p>
            </section>

            <p style={{ marginTop: '40px', textAlign: 'center' }}>
                <a href="/" style={{ color: '#0466C9', textDecoration: 'none', fontWeight: 'bold' }}>← Volver al inicio</a>
            </p>
        </div>
    );
};

export default DocumentosLegales;