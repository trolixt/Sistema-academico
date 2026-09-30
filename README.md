# Sistema académico

Aplicación web separada en frontend Next.js, API Express y base de datos MySQL. Las pantallas obtienen registros e indicadores a través de la API; el navegador no contiene conjuntos de datos de ejemplo ni cifras académicas fijas.

## Estructura

```text
backend/
  src/
    config/                     Conexión, configuración y seed
    controllers/                Controladores HTTP
    middlewares/                Autenticación, roles y errores
    repositories/               Consultas SQL y persistencia
    routes/                     Rutas REST por dominio
    services/                   Validación y reglas de negocio
    types/                      Tipos de API
frontend/
  src/
    app/                        Rutas y layouts de Next.js App Router
    components/                 Elementos compartidos y sesión
    features/                   Pantallas organizadas por función
    lib/                        Cliente API y permisos de navegación
    styles/                     Estilos globales
    types/                      Tipos del frontend
docs/
  database.sql                  Esquema y datos iniciales para MySQL
  CREDENCIALES_DEMO.txt         Cuentas locales de demostración
  *.md                          Requisitos y documentación del sistema
```

## Ejecución local

1. Crea la base MySQL e importa `docs/database.sql`.
2. Copia `backend/.env.example` a `backend/.env` y configura MySQL, JWT y CORS.
3. En `backend/`, ejecuta `npm install` y luego `npm run dev`.
4. Copia `frontend/.env.example` a `frontend/.env.local` si la API no usa `http://localhost:4000/api`.
5. En `frontend/`, ejecuta `pnpm install` y luego `pnpm dev`.

La API usa el puerto 4000 de forma predeterminada y Next.js el puerto 8443. `docs/CREDENCIALES_DEMO.txt` lista las cuentas de demostración incluidas en el SQL inicial; cambia esas contraseñas antes de publicar el sistema.

## Flujo de datos

El frontend inicia sesión contra `/api/auth/login` y envía el token a las rutas protegidas. Las páginas consultan la API para leer y guardar información. Los indicadores se calculan usando filas devueltas por la API y los formularios guardan mediante endpoints; la autorización por rol y las reglas de negocio viven en el backend.
