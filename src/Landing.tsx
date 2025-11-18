import AuthPanel from './AuthPanel';

// Definición de Estilos (para simplicidad, se usan estilos inline)
// En producción, se recomienda usar CSS modules o un framework como Tailwind.
const styles = {
    // 💡 NUEVOS ESTILOS PARA EL HEADER AÑADIDOS
    headerContainer: {
        position: 'absolute' as const, 
        top: '30px',
        left: '20px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none', 
        color: '#fff', 
        paddingBottom: '30px',
    },
    logo: {
        width: '35px', 
        height: '35px',
        marginRight: '10px',
    },
    brandName: {
        fontSize: '1.65rem',
        fontWeight: '400' as const, 
        margin: 0,
        fontFamily: 'Alata, sans-serif', // <-- Fuente 'Alata' aplicada
    },
    // FIN DE ESTILOS AÑADIDOS
    
    container: {
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        minHeight: '100vh',
        paddingTop: '0', // Eliminar padding superior
    },
    section: {
        padding: '30px 20px',
        textAlign: 'center' as const, // Forzar la inferencia de tipo 'center'
    },
    hero: {
        backgroundColor: '#0466C9', // Azul corporativo
        color: '#fff',
        padding: '50px 20px',
        minHeight: '80vh', // Ocupar gran parte de la pantalla móvil inicial
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative' as const, // 🚨 NECESARIO: Agregado para que el header flotante (position: absolute) funcione dentro de esta sección.
    },
    heroTitle: {
        fontSize: '1.6rem', // Grande en móvil
        fontWeight: '600' as const, // Máxima visibilidad
        marginBottom: '10px',
        marginTop: '20px',
        fontFamily: 'Alata, sans-serif',
    },
    heroSubtitle: {
        fontSize: '1.2rem',
        marginBottom: '30px',
        fontWeight: '300' as const,
    },
    ctaButtonPrimary: {
        backgroundColor: '#ffc107', // Amarillo/Naranja (Alto Contraste)
        color: '#333',
        border: 'none',
        padding: '15px 30px',
        fontSize: '1.1rem',
        fontWeight: '700' as const,
        borderRadius: '5px',
        cursor: 'pointer',
        textDecoration: 'none',
        marginBottom: '10px',
        width: '80%', // Mobile first: Botón ancho
        maxWidth: '350px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease',
    },
    ctaButtonSecondary: {
        backgroundColor: 'transparent',
        color: '#fff',
        border: '2px solid #fff',
        padding: '12px 28px',
        fontSize: '1rem',
        fontWeight: '600' as const,
        borderRadius: '5px',
        cursor: 'pointer',
        textDecoration: 'none',
        width: '80%',
        maxWidth: '350px',
    },
    benefitCard: {
        marginBottom: '40px',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    },
    icon: {
        fontSize: '3rem', // Ícono grande para impacto visual
        color: '#0077cc',
        marginBottom: '15px',
    },
    benefitTitle: {
        fontSize: '1.5rem',
        fontWeight: '700' as const,
        marginBottom: '10px',
    },
    registerSection: {
        backgroundColor: '#e6f2ff', // Un azul claro de fondo para destacar la sección de registro
        padding: '50px 20px',
        textAlign: 'center' as const,
    },
};

const Landing = () => {
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
                {/* FIN DEL HEADER AÑADIDO */}

                <h1 style={styles.heroTitle}>
                    Ordena tu inventario en segundos. <br/> Desde el celular. <br/>Gratis.
                </h1>
                <p style={styles.heroSubtitle}>
                    Control total de tu stock, entradas y salidas en segundos.
                </p>
                <a href="#registro" style={styles.ctaButtonPrimary}>
                    ✅ Empieza ahora
                </a>
                <a href="#registro" style={styles.ctaButtonSecondary}>
                    Ya tengo cuenta
                </a>
            </header>

            {/* 2. BENEFICIOS CLAVE (Vectorial) */}
            <section style={styles.section}>
                <h2>Beneficios Clave para tu Negocio</h2>
                
                {/* Beneficio 1: 100% Móvil (Libertad Operativa) */}
                <div style={styles.benefitCard}>
                    <div style={styles.icon}>📱</div>
                    <h3 style={styles.benefitTitle}>Tu Bodega en el Bolsillo</h3>
                    <p>Maneja entradas, salidas y reportes desde cualquier lugar.</p>
                </div>

                {/* Beneficio 2: Ultra Rápido (Alivio del Caos) */}
                <div style={styles.benefitCard}>
                    <div style={styles.icon}>⚡</div>
                    <h3 style={styles.benefitTitle}>Control en Segundos</h3>
                    <p>Registra o revisa un movimiento en segundos. Ahorra tiempo y evita errores.</p>
                </div>

                {/* Beneficio 3: Gratis y Sin Tarjeta (Cero Riesgo) */}
                <div style={styles.benefitCard}>
                    <div style={styles.icon}>🔒</div>
                    <h3 style={styles.benefitTitle}>Preuba con Cero Riesgo</h3>
                    <p>La versión Beta es **gratis**. No te pedimos tarjeta.</p>
                </div>

                {/* Beneficio 4 Opcional: Visualización Clara (Confianza) */}
                 <div style={styles.benefitCard}>
                    <div style={styles.icon}>👁️</div>
                    <h3 style={styles.benefitTitle}>Visualización Clara por Lotes</h3>
                    <p>Todo tu inventario, claro y ordenado por lotes. Ten confianza en tus datos de stock en todo momento.</p>
                </div>
            </section>

            {/* 3. SECCIÓN DE REGISTRO/LOGIN (Anclada para el CTA) */}
            <section id="registro" style={styles.registerSection}>
                <h2>Crea tu cuenta gratis y empieza a ordenar tu stock</h2>
                
                {/* Aquí inyectamos el componente de autenticación */}
                <AuthPanel /> 
                
                <p style={{ marginTop: '20px', fontSize: '0.85rem', color: '#666' }}>
                    Al registrarte, aceptas nuestros <a href="/terminos-y-condiciones" style={{ color: '#0077cc', textDecoration: 'none' }}>Términos y Condiciones</a> y la <a href="/politica-de-privacidad" style={{ color: '#0077cc', textDecoration: 'none' }}>Política de Privacidad</a>.
                </p>
            </section>

        </div>
    );
};

export default Landing;