import React from 'react';
// Asume que todos estos componentes están definidos en archivos separados o dentro de este archivo (si es una sola file app)
import { AuthProvider, useAuth } from './AuthContext'; 
import Login from './Login';
import Home from './Home'; 
import SuperAdminPanel from './SuperAdminPanel'; 
import Spinner from './Spinner'; // Este componente debe ser definido o reemplazado

// Componente que decide qué renderizar basado en la autenticación
const AppRouter = () => {
    // Obtenemos el estado de autenticación y el estado de carga
    const { isLoggedIn, isSuperAdmin, loading } = useAuth();
    
    // **Lógica de Renderizado:**
    
    // 1. Mostrar carga mientras el contexto verifica el token/rol
    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                flexDirection: 'column', 
                fontSize: '1.2rem' 
            }}>
                {/* Asumiendo que Spinner es un componente visual de carga */}
                <Spinner /> 
                <p style={{ marginTop: '20px' }}>Cargando datos de sesión...</p>
            </div>
        );
    }
    
    if (!isLoggedIn) {
        // Si no está logueado, muestra la pantalla de Login
        return <Login />;
    }

    if (isSuperAdmin) {
        // Si es SuperAdmin, muestra el panel especial
        return <SuperAdminPanel />; 
    }
    
    // Por defecto, si está logueado pero no es SuperAdmin, va a Home
    return <Home />;
};

function App() {
    return (
        // Envolvemos toda la aplicación con el proveedor de autenticación
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    );
}

export default App;