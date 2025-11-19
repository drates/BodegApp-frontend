import React from 'react';

// 🚨 Definir las propiedades del modal (solo necesita una función para cerrarse)
type Props = {
    onClose: () => void;
};

// 🚨 El componente ahora acepta las props
const DocumentosLegales = ({ onClose }: Props) => {
    // Estilo base para consistencia (Ajustado para el modal)
    const contentStyle: React.CSSProperties = { 
        maxWidth: '900px',
        margin: '0 auto', 
        padding: '20px 20px',
        fontSize: '0.85rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.2',
        backgroundColor: '#fff', // Fondo blanco para el contenido del modal
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)', 
        minHeight: '100%', 
        boxSizing: 'border-box',
    };

    const sectionStyle: React.CSSProperties = {
        marginBottom: '40px',
        paddingTop: '20px', 
        borderBottom: '1px solid #ddd',
    };

    const titleStyle: React.CSSProperties = {
        color: '#0466C9',
        borderBottom: '2px solid #ccc',
        paddingBottom: '10px',
        marginBottom: '20px',
    };

    // 🚨 NUEVO ESTILO: Botón de cierre para el modal (posición fija respecto al modal)
    const closeButtonStyle: React.CSSProperties = {
        // Posicionamiento absoluto dentro del contenido del modal
        position: 'absolute' as const, 
        top: '20px',
        right: '20px',
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#0466C9',
        zIndex: 110, 
    }


    return (
        // 🚨 Aplicar el estilo de contenido al div principal (para scroll y formato)
        <div style={contentStyle}>
            {/* 🚨 Botón de Cierre (usa la prop onClose) */}
            <button 
                onClick={onClose} 
                style={closeButtonStyle}
                aria-label="Cerrar Documentos Legales"
            >
                &times;
            </button> 

            <h1 style={{ textAlign: 'center', color: '#333' }}>Documentos Legales de BodegaFeliz</h1>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                Última actualización: 18 de Noviembre de 2025.
            </p>

            {/* --- SECCIÓN 1: TÉRMINOS Y CONDICIONES --- */}
            <section id="terminos" style={sectionStyle}>
                <h2 style={titleStyle}>Términos y Condiciones de Uso</h2>
                
                <p>
                    **1. Aceptación de los Términos.** Al utilizar la aplicación BodegaFeliz, usted acepta la totalidad de estos Términos y Condiciones. Si no está de acuerdo, por favor, no utilice nuestros servicios.
                </p>

                <p>
                    **2. Descripción del Servicio.** BodegaFeliz (versión Beta) proporciona una plataforma de gestión de inventario para pequeñas y medianas empresas, permitiendo registrar la entrada, salida y stock de productos en bodegas vinculadas a la cuenta del usuario.
                </p>

                <p>
                    **3. Responsabilidad del Usuario.** El usuario es el único responsable de la exactitud de la información de inventario ingresada y de la confidencialidad de sus credenciales de acceso. BodegaFeliz no se hace responsable por pérdidas derivadas de errores en la carga de datos.
                </p>

                <p>
                    **4. Acceso a Datos por Bodega.** Cada cuenta de usuario está vinculada a una Bodega por defecto. El sistema garantiza que cada usuario sólo puede ver y modificar los datos de inventario asociados a su propia Bodega.
                </p>

                <p>
                    **5. Limitación de Responsabilidad.** La aplicación se proporciona "tal cual" y BodegaFeliz no ofrece garantías, expresas o implícitas, sobre el funcionamiento ininterrumpido o libre de errores de la plataforma. La responsabilidad por daños indirectos o incidentales es limitada.
                </p>

                <p>
                    **6. Cambios a los Términos y Condiciones.** Los Términos y Condiciones pueden cambiar sin previo aviso.
                </p>

                <p style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                    <a onClick={() => { /* Scroll to top logic here if needed */ }} style={{ color: '#888', cursor: 'pointer' }}>[Ir arriba]</a>
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
                
            
            </section>

            {/* 🚨 PIE DE PÁGINA: Usa la función de cierre en lugar de la redirección */}
            <p style={{ marginTop: '40px', textAlign: 'center' }}>
                <a onClick={onClose} style={{ color: '#0466C9', textDecoration: 'none', fontWeight: 'bold', cursor: 'pointer' }}>← Volver a la página principal</a>
            </p>
        </div>
    );
};

export default DocumentosLegales;