# Sistema académico preuniversitario

## Propósito

Aplicación web para administrar una academia preuniversitaria: canales de estudio, estudiantes, docentes, matrícula, pagos, asistencia por curso y resultados de exámenes simulacro. La interfaz se divide en áreas según el rol de la cuenta.

## Componentes y ejecución

- `frontend/`: aplicación web Next.js.
- `backend/`: API Express con TypeScript.
- `docs/database.sql`: esquema y datos iniciales de demostración.
- `docs/migracion-canal-estudiante.sql`: actualización del esquema para canales y matrículas por canal.
- La API usa MySQL y lee sus datos de conexión de `backend/.env`.
- Configuración de referencia: `backend/.env.example`. Copiarla como `backend/.env` y completar las variables localmente. No guardar el archivo `.env` en el repositorio ni en documentación compartida.
- API local: `http://localhost:4000/api`; verificación: `GET /api/health`.
- Frontend local: `http://localhost:8443`.
- Comandos del backend: `npm run dev`, `npm run build`, `npm start`, `npm run seed`.
- Comandos del frontend: `npm run dev`, `npm run lint`, `npm run build`.

## Configuración de base de datos

`backend/src/config/database.ts` carga `backend/.env` y usa `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`, sin credenciales alternativas escritas en el código. Las cinco variables deben existir; `DB_PASSWORD` puede estar vacía en un entorno local si el servidor MySQL no usa contraseña. `DB_PORT` debe ser un puerto válido.

También se utilizan `PORT`, `FRONTEND_URL`, `JWT_SECRET` y `JWT_EXPIRES_IN` para el servidor, CORS y sesiones. Configura un `JWT_SECRET` aleatorio y privado para cada entorno. Cambia las contraseñas de demostración antes de cargar información real.

## Acceso y cuentas

El acceso se realiza con el ID numérico de la cuenta (`Usuario.id`) y contraseña. El servidor verifica la contraseña contra su hash bcrypt y entrega una sesión JWT. Los roles del sistema son:

- **ADMINISTRADOR**: administración completa; consulta y gestión de cuentas y áreas, personas, canales, grupos, horarios, matrícula, pagos, asistencia y simulacros.
- **ADMINISTRATIVO** (secretaría): operaciones de atención y matrícula permitidas por las rutas; no tiene los permisos generales del administrador.
- **DOCENTE**: consulta de cursos/grupos asignados y gestión de asistencia de sus clases.
- **ESTUDIANTE**: consulta de sus propios datos académicos, cursos, asistencias, pagos y resultados de simulacros.

Las contraseñas no se guardan en texto plano en la base de datos. El administrador puede restablecer contraseñas y gestionar estados de cuenta. La cuenta inactiva queda fuera de los listados normales. Para encontrarla y reincorporarla se debe conocer su ID; el DNI ayuda a reconocer datos previos, pero no sustituye ese ID. Desactivar una cuenta conserva el historial. Al retirar un estudiante, se cierran sus matrículas activas o pendientes; una reincorporación genera una nueva matrícula para el periodo correspondiente.

Las cuentas creadas desde los formularios reciben un ID de acceso del sistema. En estudiantes y docentes, si no se define una contraseña inicial, el DNI se usa como contraseña inicial. En secretaría, se solicita una contraseña. Comunicar la contraseña inicial de forma segura y cambiarla después del primer acceso.

## Estructura académica

Hay cuatro canales fijos. Cada estudiante se matricula en un canal y, por pertenecer a él, se asocia a todas las áreas configuradas para ese canal.

1. **Canal 1 — Ciencias de la Salud y Biomédicas:** Biología, Anatomía, Química, Razonamiento Matemático, Razonamiento Verbal, Física y Lenguaje.
2. **Canal 2 — Ciencias Exactas e Ingenierías:** Álgebra, Geometría, Trigonometría, Aritmética, Física, Química, Razonamiento Matemático y Razonamiento Verbal.
3. **Canal 3 — Ciencias Sociales, Letras y Humanidades:** Lenguaje y Literatura, Historia (del Perú y Universal), Geografía, Economía, Educación Cívica, Filosofía y Psicología, Razonamiento Verbal y Razonamiento Matemático.
4. **Canal 4 — Ciencias Empresariales y Actuariales:** Economía, Aritmética, Álgebra, Razonamiento Matemático, Razonamiento Verbal, Lenguaje, Historia y Geografía.

El administrador puede editar la información y las áreas de cada canal, además de organizar docentes, grupos y horarios. Una cuenta docente puede ser desactivada si no conserva grupos activos; reasignar esos grupos permite completar la desactivación.

## Estudiantes y matrícula

La ficha del estudiante reúne datos personales, canal, áreas/cursos, asistencia, resultados de simulacros y situación de matrícula. La búsqueda administrativa lista estudiantes activos; el administrador puede buscar por ID para consultar una cuenta inactiva. Si se detecta un DNI previamente registrado, el flujo ofrece reincorporar los datos existentes usando el ID correcto, en lugar de crear otro registro con el mismo DNI.

La matrícula se realiza por canal. Se conserva el flujo existente de pagos con sus cuotas del periodo, fechas e importes. Los pagos se vinculan a la matrícula y se consultan desde las vistas de administración y del estudiante según el rol.

## Asistencia

Las marcas posibles son presente, tardanza, falta y justificado. Para el porcentaje de cada estudiante en cada curso, presente aporta 2 puntos al numerador y 2 al denominador; tardanza aporta 1 y 2; falta aporta 0 y 2; justificado no suma numerador ni denominador. El porcentaje es `puntos obtenidos / puntos computables × 100`. Por ejemplo, presente, tardanza, falta, presente y falta justificada dan `5/8 = 62.5%`. En la vista se muestra el porcentaje; el detalle de marcas puede ser consultado por quienes tengan permiso.

La asistencia se registra por sesión/grupo. El horario asignado al grupo determina las sesiones esperadas; una sesión justificada no penaliza el porcentaje.

## Exámenes simulacro

El administrador puede crear simulacros por canal y registrar los puntajes por estudiante. El puntaje máximo previsto es 600 puntos. El estudiante puede consultar sus propios resultados, y el administrador puede revisar el historial individual.

## Datos principales

El esquema SQL documenta las tablas. Conceptualmente incluye:

- `Usuario` y perfiles específicos (`Administrador`, `PersonalAdministrativo`, `Docente`, `Estudiante`) para acceso y datos personales.
- `Canal`, `Curso`/área y sus asociaciones para la oferta académica.
- ciclos, grupos y horarios para asignaciones docentes y programación.
- matrícula y pagos para inscripción y seguimiento de cuotas.
- sesiones y detalle de asistencia por estudiante.
- simulacros y resultados por estudiante.

Usa primero `docs/database.sql` para una base nueva y aplica la migración de canales cuando corresponda a una instalación previa. Revisa el estado y la versión de la base antes de volver a ejecutar scripts que crean o reemplazan tablas. Las migraciones no se ejecutan automáticamente al iniciar la aplicación.

## Seguridad y operación

- Mantén `backend/.env` fuera de Git y limita quién puede leerlo.
- No copies contraseñas de base de datos, secretos JWT ni datos personales reales a los documentos de `docs`.
- `docs/CREDENCIALES_DEMO.txt` contiene solo las credenciales de cuentas ficticias insertadas por el SQL de demostración; no representa las cuentas existentes en una base de datos de producción.
- Antes de usar el sistema con datos reales, cambia las claves demo, define secretos fuertes, verifica permisos MySQL y configura copias de seguridad.
- Las cuentas activas reales se consultan en la sección de administración; sus contraseñas no se pueden recuperar porque se almacenan como hashes. Usa el restablecimiento de contraseña.
