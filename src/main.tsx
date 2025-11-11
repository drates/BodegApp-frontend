import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// 1. Obtener el elemento root
const rootElement = document.getElementById('root');

// 2. Verificar si el elemento existe antes de crear la raíz
if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
} else {
    // Esto es opcional, solo para depuración en caso de que falte el div#root
    console.error("No se encontró el elemento 'root' en el DOM.");
}