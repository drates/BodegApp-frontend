import AuthPanel from './AuthPanel';
import TerminosPrivacidad from './TerminosPrivacidad'; 
import { useState } from 'react';

// Definición de las propiedades que el componente Landing acepta.
interface LandingProps {
    defaultMode: 'login' | 'register'; // Indica si el formulario debe iniciar en 'login' o 'register'
}

// Definición de Estilos (para simplicidad, se usan estilos inline)
const styles = {
    // 💡 NUEVOS ESTILOS PARA EL HEADER AÑADIDOS
    headerContainer: {
        position: 'absolute' as const, 
        top: '15px',
        left: '10px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none', 
        color: '#fff', 
        paddingBottom: '30px',
    },
    logo: {
        width: '25px', 
        height: '25px',
        marginRight: '10px',
    },
    brandName: {
        fontSize: '1.35rem',
        fontWeight: '400' as const, 
        margin: 0,
        fontFamily: 'Alata, sans-serif', // <-- Fuente 'Alata' aplicada
    },
   
    // 🚨 AÑADIR: Estilos para el Modal
    modalOverlay: {
        position: 'fixed' as const, // Cubre toda la pantalla y no se mueve al hacer scroll
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Fondo oscuro semitransparente
        display: 'flex' as const,
        justifyContent: 'center' as const,
        alignItems: 'flex-start' as const, //
        zIndex: 100, // Debe estar por encima de todo
        overflowY: 'auto' as const, // ✅ CORRECCIÓN: Permite scroll dentro del overlay
        padding: '20px 0', 
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        maxWidth: '95%',
        margin: '0 auto',
        width: 'calc(100% - 40px)', 
        boxSizing: 'border-box' as const,
        position: 'relative' as const, // Importante para posicionar el botón de cierre dentro
    },
    
    // FIN DE ESTILOS AÑADIDOS
    
    container: {
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        backgroundColor: '#e6f2ff', // Un azul claro de fondo para destacar la sección de registro
        minHeight: '100vh',
        paddingTop: '0', // Eliminar padding superior
    },
    section: {
        padding: '20px 20px',
        textAlign: 'center' as const, // Forzar la inferencia de tipo 'center'
    },
    hero: {
        backgroundColor: '#0466C9', // Azul corporativo
        color: '#fff',
        padding: '20px 20px',
        minHeight: '4vh', // Ocupar gran parte de la pantalla móvil inicial
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative' as const, // 🚨 NECESARIO: Agregado para que el header flotante (position: absolute) funcione dentro de esta sección.
    },
    
    registerSection: {
        padding: '20px 20px',
        textAlign: 'center' as const,
    },
};

const Landing = ({ defaultMode }: LandingProps) => { // 🟢 Aceptar la prop aquí
    
    const [showTermsModal, setShowTermsModal] = useState(false);
    
    return (
        <div style={styles.container}>
            {/* 1. HERO (MÁXIMA CONVERSIÓN) */}
            <header style={styles.hero}>
                
                {/* 💡 HEADER/LOGO AÑADIDO */}
                <a href='/' style={styles.headerContainer as any}>
                    <img 
                        src="/logoheader.svg" 
                        alt="Logo de BodegaFeliz" 
                        style={styles.logo}
                    />
                    <h1 style={styles.brandName}>BodegaFeliz</h1>
                </a>
            </header>

            {/* 3. SECCIÓN DE REGISTRO/LOGIN (Anclada para el CTA) */}
            <section id="registro" style={styles.registerSection}>
                {/*<h2 style={{fontSize: '0.95rem'}}>Ordena tu bodega en segundos</h2>*/}
                
                {/* 🟢 CAMBIO: Pasar la prop 'defaultMode' al AuthPanel */}
                <AuthPanel defaultMode={defaultMode} /> 
                
                <p style={{ marginTop: '20px', fontSize: '0.85rem', color: '#666' }}>
                    Al registrarte, aceptas nuestros 
                    {/* 🚨 4. Cambiar el href por onClick */}
                    <a 
                        onClick={() => setShowTermsModal(true)} 
                        style={{ color: '#0077cc', textDecoration: 'none', cursor: 'pointer' }}
                    >
                        Términos y Condiciones y la Política de Privacidad.
                    </a>
                </p>
            </section>

        {/* 🚨 6. Lógica para renderizar el Modal */}
            {showTermsModal && (
                // El Overlay cubre toda la pantalla y permite scroll si el modal es muy alto
                <div style={styles.modalOverlay}>
                    {/* El Contenido del Modal */}
                    <div style={styles.modalContent}>
                        {/* Pasar la función para cerrar el modal */}
                        <TerminosPrivacidad onClose={() => setShowTermsModal(false)} />
                    </div>
                </div>
            )}

        </div>
    );
};

export default Landing;