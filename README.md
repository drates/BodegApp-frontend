## 2. README del Frontend (React / TypeScript)

```markdown
# 🎨 BodegApp Cliente Web

Aplicación web de gestión de inventario desarrollada con React y TypeScript.

## 🚀 Stack Tecnológico
 
* **Framework:** React.js
* **Lenguaje:** TypeScript
* **Build Tool/Dev Server:** Vite
* **Estilo:** CSS plano / Componentes funcionales (Hooks)
* **Librerías Clave:** `axios`, `jwt-decode`

## 💻 Configuración para Desarrollo Local

1.  **Instalar Dependencias:**
    ```bash
    npm install 
    ```
2.  **Configurar Proxy (CRÍTICO):** El archivo `vite.config.ts` utiliza un proxy para redirigir las llamadas a `/api/*` al servidor de desarrollo del Backend (`http://localhost:5000`).
    
    *Asegúrate de que el Backend de .NET esté corriendo en `http://localhost:5000`.*
    ```typescript
    // Contenido clave en vite.config.ts
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000/', 
          changeOrigin: true, 
          secure: false,
        },
      },
    },
    ```
3.  **Ejecutar el Cliente:**
    ```bash
    npm run dev
    ```
    El cliente se abrirá en `http://localhost:5173`.

## 🌐 Manejo de Sesión y Comunicación

### `utils/authFetch.ts`

Este archivo es el *middleware* central de comunicación con la API.

* **Token Injection:** Lee el token JWT de `localStorage` y lo añade al encabezado de todas las peticiones: `Authorization: Bearer [token]`.
* **Base URL:** Usa la variable `API_BASE_URL` definida en `config.ts` (que lee de las variables de entorno de Vite).
* **Manejo de 401:** Si la API devuelve un código de estado `401 Unauthorized`, automáticamente remueve el token de `localStorage` (limpia la sesión) y notifica un error.

### `App.tsx` (Control de Flujo)

El componente principal maneja el estado de la sesión:

1.  **Validación:** Al cargar, intenta llamar a `/api/auth/me` usando `authFetch` para validar el token guardado.
2.  **Redirección:**
    * **Sin sesión (o token inválido):** Muestra el componente `<Landing />`, que contiene el `<AuthPanel />` (Login/Registro).
    * **Con sesión (`userInfo`):** Muestra `<Home />` o `<SuperAdminPanel />` dependiendo del `Role` obtenido del token.

### `AuthPanel.tsx` (Login/Registro)

* Utiliza `authFetch` para comunicarse con `/api/auth/login` y `/api/auth/register`.
* **CRÍTICO:** Las llamadas a autenticación usan el flag `skipAuthCheck: true` en `authFetch` para evitar que el *middleware* de `authFetch` purgue el token ante un `401` de credenciales inválidas, permitiendo manejar el error de forma manual en el componente.

## 💾 Despliegue

La aplicación está diseñada para ser desplegada como una **Azure Static Web App (SWA)**.

* **Producción:** La URL de la API se define en la variable de entorno `VITE_API_BASE_URL` (e.g., configurada en el entorno de la SWA), que apunta a la API de .NET.
* **Ruteo:** El archivo `staticwebapp.config.json` define la regla de `navigationFallback` para que las rutas del cliente (ej: `/home`) redirijan a `index.html` (Single Page Application, SPA).