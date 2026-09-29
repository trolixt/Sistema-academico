# DOCUMENTACIÓN TÉCNICA Y ANÁLISIS INTEGRAL DEL PROYECTO
## Sistema de Gestión Administrativa y Académica para Academias

---

## 1. RESUMEN GENERAL DEL SISTEMA

### 1.1. Qué problema resuelve el sistema
Las academias preuniversitarias, de refuerzo escolar y de idiomas suelen enfrentar desorganización operativa debido al uso de registros manuales, hojas de cálculo dispersas o herramientas no integradas. Esto genera:
- Lentitud e inconsistencia en la atención de matrículas y cobro de mensualidades.
- Dificultad para controlar vacantes y horarios de docentes/aulas sin solapamientos.
- Falta de un registro fidedigno y centralizado de la asistencia diaria.
- Procesos desordenados de registro, corrección y publicación de calificaciones.
- Falta de visibilidad inmediata para que los estudiantes consulten sus horarios, notas, asistencias y pagos pendientes.

El sistema resuelve esta problemática centralizando, asegurando y automatizando los flujos administrativos y académicos en una plataforma web integral, modular y con roles claramente delimitados.

### 1.2. Tipo de aplicación
- **Naturaleza:** Aplicación Web de Gestión Empresarial y Académica (SaaS / Web App interna).
- **Arquitectura:** Arquitectura desacoplada en capas (Frontend SPA interactivo + Backend REST API estructurado en Controladores, Servicios y Repositorios + Base de Datos Relacional).
- **Modelo de despliegue previsto:** Sistema web responsivo accesible desde navegadores modernos en computadoras y dispositivos móviles.

### 1.3. Usuarios del sistema
El sistema está diseñado para 4 tipos de usuarios:
1. **Administrador del sistema:** Personal técnico y directivo responsable de la configuración institucional, oferta formativa, gestión de personal, docentes, grupos y supervisión global.
2. **Personal Administrativo:** Secretarías, personal de caja, coordinadores de admisión y encargados de atención que ejecutan las operaciones diarias de captación, registro, creación de credenciales de alumnos, matriculación y cobranza.
3. **Docente:** Profesores responsables de la ejecución de clases, toma y cierre de asistencia, creación de evaluaciones e ingreso/publicación de calificaciones de sus grupos asignados.
4. **Estudiante:** Alumnos inscritos que acceden al portal de autoservicio para consultar su situación de matrícula, horarios semanales, asistencia detallada por curso, calificaciones publicadas y cronograma de pagos.

### 1.4. Principales módulos
1. **Módulo de Autenticación y Cuentas de Personal:** Control de acceso, sesiones seguras y administración de credenciales para administradores, administrativos y docentes.
2. **Módulo de Estudiantes y Cuentas de Alumnos:** Registro integral de datos personales y provisión inmediata de accesos.
3. **Módulo de Oferta Académica (Cursos, Ciclos y Grupos):** Definición de materias, periodos académicos, configuración de grupos, asignación docente y control de capacidad.
4. **Módulo de Horarios y Aulas:** Asignación de días, bloques de horas y espacios físicos evitando colisiones de profesores o salones.
5. **Módulo de Matrículas:** Inscripción formal de estudiantes en grupos y ciclos vigentes, generación de código unívoco y control de cupos.
6. **Módulo de Pagos y Caja:** Registro de conceptos (matrícula, cuotas), métodos de pago, conciliación de estados y anulaciones auditadas.
7. **Módulo de Asistencia:** Apertura de sesiones por fecha y grupo, registro de estados (Presente, Ausente, Tardanza) y bloqueo/cierre de sesión.
8. **Módulo de Evaluaciones y Notas:** Ciclo de vida de evaluaciones (Borrador -> Registro -> Publicación), cálculo de promedios y visualización bloqueada.
9. **Módulo de Portal del Estudiante:** Espacio de consulta académica y administrativa agrupada por cursos y matrícula.
10. **Módulo de Consultas y Reportes Operativos:** Vistas resumidas de rendimiento, asistencia y finanzas para personal administrativo y directivo.

### 1.5. Principales procesos del sistema
- **Proceso 1: Configuración Operativa Inicial:** Creación de ciclos, catálogo de cursos, registro de docentes, apertura de grupos y programación de horarios.
- **Proceso 2: Admisión, Registro, Usuario y Matrícula:** Búsqueda previa por DNI; si es nuevo, registro de datos personales, creación simultánea de su usuario/contraseña, selección de ciclo/grupo, validación de vacante y registro del pago inicial.
- **Proceso 3: Cobranza Recurrente:** Emisión, recepción y control de mensualidades con control de comprobantes e histórico inmutable.
- **Proceso 4: Control Diario de Asistencia:** Toma de asistencia por el docente en su clase del día, guardado preliminar y cierre definitivo para congelar registros.
- **Proceso 5: Ciclo de Calificaciones:** Creación de evaluación por el docente, ingreso de notas en borrador, revisión interna, publicación para consulta del alumno y reapertura excepcional autorizada por el Administrador.

### 1.6. Información que administra
- **Datos de Identidad y Acceso:** Cuentas de usuario, credenciales hasheadas, roles, estados (Activo/Inactivo).
- **Datos Personales y Contacto:** DNI, nombres, apellidos, correo, teléfono, dirección, fecha de nacimiento (de estudiantes, docentes y personal).
- **Estructura Formativa:** Cursos, descripción, carga horaria, ciclos académicos (fechas inicio/fin), grupos (código, capacidad, aula).
- **Planificación Horaria:** Asignaciones de día, hora de inicio, hora de fin, aula y docente por grupo.
- **Registros Transaccionales:** Matrículas (código, ciclo, estudiante, grupo, estado, fecha) y Pagos (concepto, monto, método, fecha, estado).
- **Registros Académicos:** Sesiones de asistencia (fecha, estado abierta/cerrada), detalle de asistencia por alumno, evaluaciones (nombre, fecha, estado borrador/publicada) y calificaciones numéricas individuales (0 a 20).

### 1.7. Alcance actual del proyecto y Propuestas de Mejora
- **Alcance Actual Definido:** Gestión interna centralizada de 4 roles, matrícula presencial/administrativa, gestión de cobros en caja, control de asistencia por sesión y registro de notas en escala vigesimal (0-20).
- **Propuestas de Mejora (Funcionalidades adicionales sugeridas fuera del núcleo actual):**
  - *Propuesta de Mejora 1 (Cobros):* Implementación de pasarela de pagos online para que el estudiante pague directamente desde su portal.
  - *Propuesta de Mejora 2 (Ponderaciones):* Soporte para pesos porcentuales configurables por evaluación en lugar de promedio simple aritmético.
  - *Propuesta de Mejora 3 (Notificaciones):* Envío automático de alertas por correo o WhatsApp para recordatorios de pago y notificación de inasistencias.
  - *Propuesta de Mejora 4 (Auditoría Integral):* Tabla de logs de auditoría para registrar cada cambio de estado sensible (anulaciones, reapertura de notas).

---

## 2. ANÁLISIS DE ROLES Y PERMISOS

### 2.1. Matriz Detallada de Permisos por Rol

| Entidad / Proceso | Administrador del Sistema | Personal Administrativo | Docente | Estudiante |
| :--- | :--- | :--- | :--- | :--- |
| **Cuentas de Personal (Admin, Staff, Docente)** | Crear, Modificar, Activar/Desactivar, Consultar | Sin acceso | Sin acceso | Sin acceso |
| **Cuentas de Estudiantes (Creación de Acceso)** | Consulta global | **Crea en Registro**, Modifica datos, Activa/Desactiva | Sin acceso | Sin acceso |
| **Datos Personales de Estudiantes** | Consulta global | Crear, Modificar, Consultar | Consulta solo de sus grupos asignados | Consulta solo de sus propios datos |
| **Datos de Docentes** | Crear, Modificar, Activar/Desactivar, Consultar | Consulta informativa | Consulta de su propio perfil | Consulta de sus docentes asignados |
| **Cursos y Ciclos Académicos** | Crear, Modificar, Cambiar estado, Consultar | Consulta de oferta disponible | Consulta de sus cursos | Consulta de sus cursos matriculados |
| **Grupos y Asignación Docente** | Crear, Modificar, Asignar Docente/Aula, Consultar | Consulta de disponibilidad/vacantes | Consulta de sus propios grupos | Consulta de su grupo matriculado |
| **Horarios** | Crear, Modificar, Eliminar/Reasignar, Consultar | Consulta informativa | Consulta de su horario de clases | Consulta de su horario de clases |
| **Matrículas** | Consulta global | **Crear**, Cambiar estado (Activa/Cancelada/Retirada), Consultar | Consulta de lista de matriculados en sus grupos | Consulta de su propia matrícula |
| **Pagos** | Consulta global y financiera | **Registrar pago**, **Anular pago**, Consultar | Sin acceso | Consulta de sus propios pagos y deudas |
| **Sesiones de Asistencia** | Consulta global | Consulta de resumen por estudiante | **Crear**, **Modificar (Abierta)**, **Cerrar (Bloquear)** | Consulta de su récord por curso |
| **Evaluaciones** | Consulta global, **Reabrir evaluación publicada** | Consulta de resumen por estudiante | **Crear**, **Modificar (Borrador)**, **Publicar** | Consulta solo de evaluaciones publicadas |
| **Registro de Calificaciones** | Consulta global | Consulta de promedios | **Registrar/Modificar (Borrador)** | Consulta de sus propias notas publicadas |

---

### 2.2. Perfiles Específicos y Restricciones Clave

#### Administrador del Sistema
- **Responsabilidad:** Gobernanza, configuración de la institución y supervisión.
- **Acciones Críticas Permitidas:** Gestionar accesos del personal administrativo y docente; crear la oferta formativa (ciclos, cursos, grupos, horarios); reactivar evaluaciones publicadas si un docente requiere rectificar notas.
- **Restricciones Explícitas:** **NO debe crear las cuentas de los estudiantes** durante las operaciones diarias (para no duplicar el trabajo ni generar cuellos de botella); no registra notas ordinarias ni pasa asistencia diaria.

#### Personal Administrativo (Secretaría / Admisión / Caja)
- **Responsabilidad:** Operación diaria de atención, inscripción y cobranza.
- **Acciones Críticas Permitidas:** Buscar/registrar estudiantes; crear la cuenta de usuario del alumno en el mismo paso de registro; matricular en grupos con vacantes; registrar pagos y anular transacciones erróneas (con registro de auditoría).
- **Restricciones Explícitas:** No puede crear cursos, ciclos ni grupos; no puede modificar la estructura de horarios; no puede crear evaluaciones ni calificar; no puede gestionar cuentas de otros trabajadores.

#### Docente
- **Responsabilidad:** Gestión pedagógica y control de aula.
- **Acciones Críticas Permitidas:** Visualizar la nómina de alumnos de sus grupos; registrar y cerrar asistencia diaria; crear evaluaciones dentro de sus grupos asignados; guardar notas en borrador y publicarlas formalmente.
- **Restricciones Explícitas:** No tiene acceso a datos financieros o pagos de los estudiantes; no puede crear nuevos grupos ni matricular alumnos; no puede modificar asistencias cerradas ni notas publicadas sin autorización administrativa; no puede ver información de grupos de otros docentes.

#### Estudiante
- **Responsabilidad:** Consulta y seguimiento de su proceso formativo.
- **Acciones Críticas Permitidas:** Iniciar sesión con sus credenciales; consultar sus cursos activos, horario semanal, detalle de asistencia por materia, notas publicadas, estado de matrícula y cronograma de pagos.
- **Restricciones Explícitas:** Rol 100% de solo lectura (consulta); no puede alterar registros, notas, asistencias, pagos ni datos de otros alumnos.

---

## 3. ANÁLISIS DE MÓDULOS

```
+-------------------------------------------------------------------------+
|                         ARQUITECTURA DE MÓDULOS                         |
+-------------------------------------------------------------------------+
|  [M01: Autenticación y Cuentas] ---> [M02: Personal y Docentes]         |
|         |                                      |                        |
|         v                                      v                        |
|  [M03: Estudiantes y Cuentas]       [M04: Oferta Académica y Ciclos]    |
|         |                                      |                        |
|         +----------------+    +----------------+                        |
|                          |    |                                         |
|                          v    v                                         |
|                  [M05: Horarios y Aulas]                                |
|                          |                                              |
|                          v                                              |
|                  [M06: Matrículas] <------------+                       |
|                   /              \              |                       |
|                  v                v             |                       |
|          [M07: Pagos y Caja]   [M08: Asistencia y Notas]                |
|                  \                /                                     |
|                   v              v                                      |
|               [M09: Portal del Estudiante]                              |
|               [M10: Reportes y Auditoría]                               |
+-------------------------------------------------------------------------+
```

### Módulo 1: Autenticación, Usuarios y Control de Acceso
- **Objetivo:** Gestionar el ciclo de vida de las credenciales de acceso, la emisión de sesiones/tokens seguros y la validación de roles en cada solicitud.
- **Usuarios:** Todos (Administrador, Administrativo, Docente, Estudiante).
- **Información que administra:** `nombre_usuario`, `password_hash`, `rol`, `estado` (Activo/Inactivo), fecha de último acceso.
- **Operaciones:** Login, Logout, Cambio de contraseña, Activación/Desactivación de cuenta, Validación de sesión.
- **Dependencias:** Es transversal a todos los módulos.
- **Reglas clave:** Ninguna contraseña se guarda en texto plano; cuentas inactivas quedan inmediatamente bloqueadas; cierre de sesión revoca el token/sesión.

### Módulo 2: Gestión de Estudiantes y Cuentas de Acceso
- **Objetivo:** Administrar el expediente general del alumno e instrumentar la provisión automática de su cuenta de usuario institucional.
- **Usuarios:** Personal Administrativo (gestión), Administrador (supervisión).
- **Información que administra:** `codigo_estudiante`, `nombres`, `apellidos`, `dni`, `fecha_nacimiento`, `telefono`, `correo`, `direccion`, `estado`, vínculo con `usuario_id`.
- **Operaciones:** Búsqueda predictiva (por DNI/Nombre/Código), Registro de nuevo estudiante, Creación de credenciales, Actualización de datos de contacto, Desactivación lógica.
- **Dependencias:** Módulo de Autenticación (crea registro en Usuario).
- **Reglas clave:** DNI y Código deben ser estrictamente únicos; no se permite eliminar físicamente estudiantes con historial de matrículas o pagos.

### Módulo 3: Oferta Formativa (Cursos, Ciclos y Grupos)
- **Objetivo:** Estructurar los periodos de estudio, las materias ofrecidas y las secciones operativas con sus respectivos docentes y aforos.
- **Usuarios:** Administrador (crea y edita), Personal Administrativo (consulta para matricular), Docente (consulta sus asignaciones).
- **Información que administra:** Cursos (`nombre`, `descripcion`, `horas_semanales`, `estado`), Ciclos (`nombre`, `fecha_inicio`, `fecha_fin`, `estado`), Grupos (`codigo`, `curso_id`, `ciclo_id`, `docente_id`, `capacidad`, `aula_base`, `estado`).
- **Operaciones:** Crear curso, crear ciclo, aperturar grupo, asignar docente a grupo, verificar cupos disponibles.
- **Dependencias:** Módulo de Docentes.
- **Reglas clave:** No se puede aperturar un grupo sin docente ni curso válido; la capacidad de grupo debe ser un entero positivo mayor a cero.

### Módulo 4: Horarios y Asignación de Espacios
- **Objetivo:** Planificar y verificar la distribución semanal de clases por grupo y salón físico.
- **Usuarios:** Administrador (gestión), Docente y Estudiante (consulta de agenda).
- **Información que administra:** `grupo_id`, `dia_semana`, `hora_inicio`, `hora_fin`, `aula`.
- **Operaciones:** Programar bloque de clase, editar horario, consultar cronograma semanal por grupo, docente o aula.
- **Dependencias:** Módulo de Grupos y Oferta Formativa.
- **Reglas clave:** Validación obligatoria contra solapamiento temporal del mismo docente en distintos grupos; validación contra solapamiento de la misma aula en el mismo bloque horario.

### Módulo 5: Matrículas
- **Objetivo:** Formalizar la inscripción de un estudiante en un grupo y ciclo determinado, asegurando el control de aforo.
- **Usuarios:** Personal Administrativo (registro y modificación), Estudiante (consulta de comprobante), Docente (consulta de nómina).
- **Información que administra:** `codigo_matricula`, `estudiante_id`, `grupo_id`, `ciclo_id`, `fecha_registro`, `estado` (`ACTIVA`, `CANCELADA`, `RETIRADA`).
- **Operaciones:** Verificar vacante disponible, generar código de matrícula correlativo, inscribir estudiante, anular/retirar matrícula.
- **Dependencias:** Módulo de Estudiantes, Módulo de Grupos, Módulo de Ciclos.
- **Reglas clave:** Un estudiante no puede tener dos matrículas activas en el mismo grupo en el mismo ciclo; no se puede matricular si el aforo del grupo está completo (`matriculas_activas >= capacidad`).

### Módulo 6: Pagos y Control de Caja
- **Objetivo:** Registrar las transacciones económicas asociadas a la matrícula y emitir el historial financiero del alumno.
- **Usuarios:** Personal Administrativo (registro y anulación), Estudiante (consulta de comprobantes), Administrador (supervisión).
- **Información que administra:** `matricula_id`, `concepto` (Matrícula, Mensualidad 1, 2, 3...), `monto`, `metodo_pago` (Efectivo, Tarjeta, Transferencia, Yape/Plin), `fecha_pago`, `estado` (`PAGADO`, `PENDIENTE`, `ANULADO`).
- **Operaciones:** Registrar pago con fecha y método, listar pagos por matrícula, listar cuentas pendientes, anular pago erróneo.
- **Dependencias:** Módulo de Matrículas.
- **Reglas clave:** Los pagos anulados nunca se borran de la base de datos (inmutabilidad financiera); todo pago debe estar vinculado a una matrícula válida.

### Módulo 7: Asistencia
- **Objetivo:** Llevar el control de presencialidad de los estudiantes por cada sesión de clase programada.
- **Usuarios:** Docente (registro y cierre), Administrativo (consulta de resumen de faltas), Estudiante (consulta de su récord).
- **Información que administra:** Sesión de Asistencia (`grupo_id`, `fecha`, `estado: ABIERTA/CERRADA`), Detalle de Asistencia (`sesion_id`, `estudiante_id`, `estado: PRESENTE/AUSENTE/TARDANZA`).
- **Operaciones:** Abrir sesión por fecha, listar alumnos matriculados, registrar estados individuales, guardar borrador, cerrar sesión definitivamente.
- **Dependencias:** Módulo de Grupos, Módulo de Matrículas.
- **Reglas clave:** Solo el docente asignado al grupo puede tomar asistencia; una vez cerrada la sesión, queda bloqueada contra modificaciones.

### Módulo 8: Evaluaciones y Calificaciones
- **Objetivo:** Gestionar los instrumentos de evaluación pedagógica, el ingreso de notas y la publicación de actas.
- **Usuarios:** Docente (crea evaluación, califica y publica), Administrador (reabre evaluaciones si se requiere rectificación), Estudiante (consulta notas publicadas).
- **Información que administra:** Evaluación (`grupo_id`, `nombre_evaluacion`, `fecha`, `estado: BORRADOR/PUBLICADA`), Detalle de Nota (`evaluacion_id`, `estudiante_id`, `valor_nota`).
- **Operaciones:** Crear evaluación, ingresar notas vigesimales (0.00 a 20.00), guardar borrador, publicar evaluación, calcular promedio aritmético del curso, reabrir evaluación.
- **Dependencias:** Módulo de Grupos, Módulo de Matrículas.
- **Reglas clave:** Las notas en borrador son invisibles para los estudiantes; una evaluación publicada bloquea la edición del docente; notas fuera del rango 0 a 20 son rechazadas automáticamente.

---

## 4. ANÁLISIS DE LOS FLUJOS DEL SISTEMA

### Flujo 1: Registro de Estudiante Nuevo, Provisión de Cuenta y Matrícula Inicial
1. **Iniciador:** Personal Administrativo.
2. **Información requerida:** DNI, nombres, apellidos, fecha de nacimiento, teléfono, correo, ciclo académico y grupo solicitado.
3. **Paso a paso:**
   - **Paso 1.1:** Administrativo ingresa el DNI en el buscador de admisiones. El sistema confirma que no existe registro previo.
   - **Paso 1.2:** Se abre el formulario integrado. El administrativo ingresa los datos personales del estudiante y define el nombre de usuario (o se autogenera con base en DNI/código) y contraseña temporal.
   - **Paso 1.3:** El sistema valida la unicidad de DNI y username, crea la entidad `Usuario` con rol `ESTUDIANTE` y hash seguro de password, y crea la entidad `Estudiante` vinculando `usuario_id`.
   - **Paso 1.4:** El administrativo selecciona el `CicloAcademico` y el `Curso`/`Grupo`.
   - **Paso 1.5 (Validación):** El sistema consulta en tiempo real las vacantes disponibles del grupo (`capacidad - matriculas_activas > 0`). Si no hay vacantes, detiene el proceso y alerta al usuario.
   - **Paso 1.6:** Si hay vacante, se crea el registro en `Matricula` con estado `ACTIVA` y se genera el código único correlativo (ej: `MAT-2027-0012`).
   - **Paso 1.7:** El sistema ofrece registrar de inmediato el pago del concepto "Matrícula" o primera cuota. Si se efectúa, se crea el registro en `Pago` con estado `PAGADO`.
4. **Resultado y Almacenamiento:** Se persisten registros en `Usuario`, `Estudiante`, `Matricula` y `Pago`.
5. **Continuación:** El estudiante recibe sus credenciales y puede iniciar sesión inmediatamente en el portal.

---

### Flujo 2: Matrícula de Estudiante Recurrente (Ya Registrado)
1. **Iniciador:** Personal Administrativo.
2. **Información requerida:** DNI o Código del estudiante ya registrado, Ciclo y Grupo a matricular.
3. **Paso a paso:**
   - **Paso 2.1:** Administrativo busca al alumno por DNI. El sistema recupera el registro existente de `Estudiante` y su `Usuario`.
   - **Paso 2.2 (Regla de integridad):** **No se crea una nueva cuenta de usuario**. Se reutiliza la existente.
   - **Paso 2.3:** Se selecciona el nuevo Ciclo y Grupo. Se valida que el alumno no esté ya matriculado en ese mismo grupo/ciclo.
   - **Paso 2.4:** Se valida la disponibilidad de vacantes del grupo.
   - **Paso 2.5:** Se genera la nueva `Matricula` asociada al mismo `estudiante_id`.
   - **Paso 2.6:** Se registra el pago inicial correspondiente en `Pago`.
4. **Resultado:** Nuevo registro en `Matricula` y `Pago` sin duplicidad de perfiles ni de cuentas de usuario.

---

### Flujo 3: Creación de Grupos, Asignación Docente y Programación de Horarios
1. **Iniciador:** Administrador del Sistema.
2. **Información requerida:** Curso, Ciclo, Docente asignado, Capacidad máxima, Aula, Día de la semana y Rango de horas.
3. **Paso a paso:**
   - **Paso 3.1:** El Administrador accede a Oferta Académica y selecciona "Crear Grupo".
   - **Paso 3.2:** Selecciona el Curso base, Ciclo Académico, Docente responsable y define el nombre/código del grupo (ej: `MAT-A`) y su capacidad máxima de estudiantes.
   - **Paso 3.3:** El sistema valida que el docente esté activo y persiste la entidad `Grupo`.
   - **Paso 3.4:** El Administrador pasa a configurar los horarios del grupo: selecciona el Día (ej: `LUNES`), `hora_inicio` (`08:00`), `hora_fin` (`10:00`) y `aula` (`Aula 101`).
   - **Paso 3.5 (Validaciones críticas):**
     - *Validación A (Docente):* El sistema verifica que el docente asignado no tenga otra clase programada en ningún grupo en el mismo día y rango horario.
     - *Validación B (Aula):* El sistema verifica que la misma aula no esté asignada a otro grupo en el mismo día y rango horario.
   - **Paso 3.6:** Si ambas validaciones pasan, se guarda el registro en `Horario`.
4. **Resultado:** Grupo operativo listo para recibir matrículas y visible en la agenda del docente.

---

### Flujo 4: Control Diario y Cierre de Asistencia
1. **Iniciador:** Docente.
2. **Información requerida:** Grupo seleccionado y Fecha de la clase.
3. **Paso a paso:**
   - **Paso 4.1:** El Docente ingresa a su módulo "Asistencia", donde el sistema lista únicamente los grupos que tiene formalmente asignados.
   - **Paso 4.2:** Selecciona el grupo y la fecha correspondiente a la sesión de clase.
   - **Paso 4.3:** El sistema consulta si ya existe una `SesionAsistencia` para ese `grupo_id` y `fecha`:
     - Si no existe, genera una sesión en estado `ABIERTA` y precarga la lista de estudiantes con matrícula `ACTIVA` en ese grupo, asignando por defecto el estado `PRESENTE`.
     - Si existe y está `ABIERTA`, carga los valores previamente guardados permitiendo su modificación.
     - Si existe y está `CERRADA`, carga los datos en modo de solo lectura (campos bloqueados).
   - **Paso 4.4:** El docente marca las novedades individuales (`PRESENTE`, `TARDANZA`, `AUSENTE`).
   - **Paso 4.5 (Opciones de guardado):**
     - *Guardar Borrador:* Guarda en `DetalleAsistencia` manteniendo la sesión `ABIERTA` para continuar editando.
     - *Cerrar Asistencia:* Guarda los detalles y actualiza `SesionAsistencia.estado = 'CERRADA'`.
4. **Resultado:** Registros congelados en base de datos; el estudiante y el administrativo pueden ver inmediatamente el récord actualizado.

---

### Flujo 5: Cobranza de Mensualidades y Anulación de Pagos
1. **Iniciador:** Personal Administrativo.
2. **Información requerida:** Código de matrícula o DNI del estudiante, Concepto, Monto, Método de pago.
3. **Paso a paso:**
   - **Paso 5.1:** El Administrativo busca la matrícula del alumno y consulta el estado de sus pagos.
   - **Paso 5.2:** Selecciona "Registrar Pago", indica el concepto (ej: `Mensualidad 2`), monto (`150.00`) y método de pago (`EFECTIVO`, `TRANSFERENCIA`, `TARJETA`, `YAPE`).
   - **Paso 5.3:** El sistema valida que la matrícula esté `ACTIVA` y guarda el registro en `Pago` con estado `PAGADO` y marca temporal del sistema.
   - **Paso 5.4 (Caso excepcional de anulación):** Si se cometió un error de digitación o importe, el Administrativo solicita anular el pago.
   - **Paso 5.5:** El sistema solicita confirmación formal. Al confirmar, el sistema actualiza `Pago.estado = 'ANULADO'`. **Bajo ninguna circunstancia se ejecuta `DELETE` sobre la tabla `Pago`**.
4. **Resultado:** Historial financiero consistente y auditable para el alumno y la administración.

---

## 5. ANÁLISIS ESPECÍFICO DEL SISTEMA DE NOTAS

### 5.1. Ciclo de Vida y Responsabilidades en el Registro de Notas

```
+-----------------------------------------------------------------------------+
|                      CICLO DE VIDA DE UNA EVALUACIÓN                        |
+-----------------------------------------------------------------------------+
|  [DOCENTE]                                                                  |
|  1. Crea Evaluación (Nombre, Fecha, Grupo)                                  |
|     --> Estado: BORRADOR                                                    |
|                                                                             |
|  2. Registra / Modifica Notas (Escala 0 a 20)                               |
|     --> Guarda Borrador (Notas invisibles para el estudiante)               |
|                                                                             |
|  3. Publica Evaluación                                                      |
|     --> Estado: PUBLICADA                                                   |
|     --> Docente queda BLOQUEADO para editar                                 |
|     --> Estudiantes visualizan notas y promedio en tiempo real              |
|                                                                             |
|  [ADMINISTRADOR DEL SISTEMA] (Solo ante rectificación excepcional)          |
|  4. Reabre Evaluación                                                       |
|     --> Estado pasa nuevamente a: BORRADOR                                  |
|     --> Docente vuelve a tener permisos de edición                          |
+-----------------------------------------------------------------------------+
```

### 5.2. Reglas Funcionales y de Dominio del Módulo de Calificaciones
1. **Pertenencia Estricta al Grupo:** Una evaluación pertenece a un único `Grupo` activo y solo puede calificar a alumnos que posean una matrícula con estado `ACTIVA` en dicho grupo.
2. **Escala Vigesimal Estricta:** Las notas son valores decimales comprendidos obligatoriamente entre `0.00` y `20.00`. Cualquier valor negativo o mayor a 20 debe ser rechazado por la validación del backend.
3. **Visibilidad Condicionada por Estado:**
   - **Estado BORRADOR:** Las calificaciones son visibles exclusivamente para el Docente del grupo y el Administrador. El Estudiante no puede ver ni la evaluación ni las calificaciones tentativas.
   - **Estado PUBLICADA:** Las calificaciones son visibles en el portal del Estudiante y en las vistas de consulta del Personal Administrativo.
4. **Inmutabilidad tras Publicación:** Una vez que el Docente pulsa "Publicar Evaluación", su interfaz bloquea los inputs de calificación. El backend debe rechazar peticiones `PUT`/`PATCH` de actualización de notas provenientes de un docente sobre evaluaciones `PUBLICADAS`.
5. **Procedimiento de Rectificación:** Si hubo un error material en una nota ya publicada, el Docente debe solicitar la reapertura al Administrador del Sistema. Solo el Administrador tiene autorización para cambiar el estado de `PUBLICADA` a `BORRADOR`.
6. **Cálculo del Promedio de Curso:**
   - El promedio mostrado al estudiante y al administrativo se calcula dinámicamente considerando **únicamente las evaluaciones en estado `PUBLICADA`**.
   - No se consideran evaluaciones en borrador para el cálculo del promedio.
   - En la especificación actual, el cálculo corresponde a la media aritmética simple de las evaluaciones publicadas del grupo.

---

## 6. ANÁLISIS DE LA BASE DE DATOS

A continuación se presenta la evaluación exhaustiva del archivo `Base de datos de la academia.txt` entidad por entidad, analizando su normalización, tipos de datos, restricciones y deficiencias técnicas.

### 6.1. Evaluación Entidad por Entidad

```
+-----------------------------------------------------------------------------------+
|                        MODELO ENTIDAD - RELACIÓN (BD ACTUAL)                      |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [Usuario] 1 ------ 1 [Estudiante] 1 ------ N [Matricula] N ------ 1 [CicloAcad]  |
|     |                                              |                              |
|     | 1                                            | N                            |
|     |                                              |                              |
|     | 1                                            v 1                            |
|  [Docente] 1 ------ N [Grupo] <--------------------+                              |
|                         |    \                                                    |
|                         | 1   +------- N [Horario]                                |
|                         |                                                         |
|                         +--- N [SesionAsistencia] 1 --- N [DetalleAsistencia]     |
|                         |                                      |                  |
|                         |                                      | N                |
|                         |                                      v 1                |
|                         +--- N [EvaluacionNotas]  1 --- N [DetalleNota]           |
|                                                    \           /                  |
|                                                     --> [Estudiante]              |
|                                                                                   |
|  [Matricula] 1 ------ N [Pago]                                                    |
+-----------------------------------------------------------------------------------+
```

#### 1. Tabla `Usuario`
- **Campos actuales:** `id` (PK), `nombre_usuario`, `password_hash`, `rol ENUM`, `estado ENUM`.
- **Análisis crítico:**
  - *Problema detectado:* La tabla `Usuario` carece de campos básicos de identidad (`nombres`, `apellidos`, `correo`) para los roles `ADMINISTRADOR` y `ADMINISTRATIVO`. La tabla `Estudiante` almacena sus propios nombres/correo, pero el personal administrativo y los administradores no tienen tabla de perfil ni campos en `Usuario`.
  - *Impacto:* Es imposible mostrar el nombre real o el correo del administrador o la secretaria en la interfaz (solo se dispone del `nombre_usuario`).
  - *Solución requerida:* Añadir `nombres`, `apellidos`, `correo` a `Usuario` o crear una tabla de perfil institucional `Personal`.

#### 2. Tabla `Estudiante`
- **Campos actuales:** `id` (PK), `usuario_id` (FK Unique), `codigo_estudiante` (Unique), `nombres`, `apellidos`, `dni` (Unique), `fecha_nacimiento`, `telefono`, `correo`, `direccion`, `estado ENUM`.
- **Análisis crítico:** Bien normalizada con relación 1:1 con `Usuario`. Posee las restricciones de unicidad adecuadas para `dni` y `codigo_estudiante`.

#### 3. Tabla `Docente`
- **Campos actuales:** `id` (PK), `usuario_id` (FK Unique), `codigo_docente` (Unique), `dni` (Unique), `telefono`.
- **Análisis crítico:**
  - *Problema detectado:* La tabla `Docente` **no tiene campos `nombres`, `apellidos`, `correo` ni `especialidad`**, y como la tabla `Usuario` tampoco los tiene, los datos del profesor quedan incompletos.
  - *Impacto:* No hay forma de guardar ni consultar el nombre completo de un docente en la base de datos actual.
  - *Solución requerida:* Agregar `nombres`, `apellidos`, `correo` y `especialidad` en la tabla `Docente`.

#### 4. Tabla `Curso`
- **Campos actuales:** `id` (PK), `nombre`, `descripcion`, `estado ENUM`.
- **Análisis crítico:** Adecuada. Se recomienda añadir `codigo_curso VARCHAR(20) UNIQUE` y `horas_semanales INT` para concordar con los datos operados en la interfaz.

#### 5. Tabla `CicloAcademico`
- **Campos actuales:** `id` (PK), `nombre`, `estado ENUM('ACTIVO','INACTIVO')`.
- **Análisis crítico:**
  - *Problema detectado:* Faltan los campos `fecha_inicio DATE` y `fecha_fin DATE`, así como el estado `PLANIFICADO` y `FINALIZADO` que aparecen en la documentación y en Figma.
  - *Solución requerida:* Agregar fechas de vigencia y ampliar el enum de estados.

#### 6. Tabla `Grupo`
- **Campos actuales:** `id` (PK), `nombre`, `curso_id` (FK), `docente_id` (FK), `estado ENUM`.
- **Análisis crítico:**
  - *Problema detectado 1 (Desvinculación de Ciclo):* La tabla `Grupo` no tiene clave foránea hacia `CicloAcademico`. En una academia, los grupos pertenecen a un ciclo específico. Actualmente `Matricula` relaciona directamente `grupo_id` y `ciclo_id`, lo que permite que una matrícula asigne un ciclo que no coincida con el ciclo del grupo.
  - *Problema detectado 2 (Falta de Capacidad/Aforo):* La tabla `Grupo` carece del campo `capacidad INT NOT NULL`. Sin este campo, es imposible que la base de datos o el backend controlen el límite de vacantes.
  - *Solución requerida:* Añadir `ciclo_id INT NOT NULL FK` y `capacidad INT NOT NULL` en la tabla `Grupo`.

#### 7. Tabla `Horario`
- **Campos actuales:** `id` (PK), `grupo_id` (FK), `dia_semana ENUM`, `hora_inicio TIME`, `hora_fin TIME`, `aula VARCHAR(50)`.
- **Análisis crítico:**
  - *Problema detectado:* El aula es un texto libre (`VARCHAR(50)`). No existe un índice único o restricción para evitar que dos grupos se programen a la misma hora en la misma aula, ni para evitar que el mismo docente tenga dos clases simultáneas.
  - *Solución requerida:* Validación obligatoria a nivel de capa de servicio / stored procedure / constraints temporales.

#### 8. Tabla `Matricula`
- **Campos actuales:** `id` (PK), `codigo_matricula` (Unique), `estudiante_id` (FK), `grupo_id` (FK), `ciclo_id` (FK), `estado ENUM('ACTIVA','CANCELADA','RETIRADA')`, `fecha_registro DATETIME`.
- **Análisis crítico:**
  - *Problema detectado:* Falta una restricción `UNIQUE (estudiante_id, grupo_id, ciclo_id)` para impedir a nivel de motor de BD que un alumno sea matriculado dos veces en el mismo grupo durante el mismo ciclo.
  - *Solución requerida:* Añadir la restricción `UNIQUE` correspondiente.

#### 9. Tabla `Pago`
- **Campos actuales:** `id` (PK), `matricula_id` (FK), `concepto`, `monto DECIMAL(10,2)`, `fecha DATETIME`, `metodo_pago ENUM`, `estado ENUM('PENDIENTE','PAGADO','ANULADO')`.
- **Análisis crítico:**
  - *Problema detectado:* Si el estado es `PENDIENTE`, el campo `fecha` (que tiene `DEFAULT CURRENT_TIMESTAMP`) se llena automáticamente al crearse, pero no existe un campo `fecha_vencimiento DATE` para saber cuándo debe pagar el alumno. Asimismo, falta un campo para registrar `numero_operacion` o `comprobante`.
  - *Solución requerida:* Añadir `fecha_vencimiento DATE NULL`, `fecha_pago DATETIME NULL` y `observaciones/comprobante`.

#### 10. Tablas `SesionAsistencia` y `DetalleAsistencia`
- **Campos actuales:**
  - `SesionAsistencia`: `id` (PK), `grupo_id` (FK), `fecha DATE`, `estado ENUM('ABIERTA','CERRADA')`, `UNIQUE(grupo_id, fecha)`.
  - `DetalleAsistencia`: `id` (PK), `sesion_asistencia_id` (FK), `estudiante_id` (FK), `estado_asistencia ENUM('PRESENTE','AUSENTE','TARDANZA')`, `UNIQUE(sesion_asistencia_id, estudiante_id)`.
- **Análisis crítico:** Estructura excelente y normalizada. La restricción `UNIQUE(grupo_id, fecha)` previene duplicar sesiones en un mismo día y `UNIQUE(sesion_asistencia_id, estudiante_id)` evita duplicar asistencias por alumno.

#### 11. Tablas `EvaluacionNotas` y `DetalleNota`
- **Campos actuales:**
  - `EvaluacionNotas`: `id` (PK), `grupo_id` (FK), `nombre_evaluacion`, `fecha DATE`, `estado ENUM('BORRADOR','PUBLICADA')`.
  - `DetalleNota`: `id` (PK), `evaluacion_id` (FK), `estudiante_id` (FK), `valor_nota DECIMAL(5,2)`, `UNIQUE(evaluacion_id, estudiante_id)`.
- **Análisis crítico:**
  - *Problema detectado:* `valor_nota` está definido como `NOT NULL`. Si un docente crea una evaluación y guarda notas parciales (algunos alumnos ausentes o aún sin calificar), el registro fallará para aquellos sin nota.
  - *Solución requerida:* Permitir `valor_nota DECIMAL(5,2) NULL` o definir un estado de calificación por estudiante. Agregar restricción `CHECK (valor_nota >= 0.00 AND valor_nota <= 20.00)`.

---

## 7. REVISIÓN DE LA BASE DE DATOS CONTRA LOS FLUJOS

### 7.1. Matriz de Cobertura: Funcionalidad vs. Tablas Reales

| Funcionalidad / Flujo del Negocio | Tablas Involucradas en la BD Actual | ¿Soporte Completo en BD? | Diagnóstico y Ajustes Requeridos |
| :--- | :--- | :---: | :--- |
| **Autenticación y Sesión de Usuario** | `Usuario` | **INCOMPLETO** | `Usuario` no guarda nombres/correo para Admin ni Personal Administrativo. |
| **Registro de Estudiante y Cuenta** | `Usuario`, `Estudiante` | **COMPLETO** | Requiere transacción atómica (insert en `Usuario` + insert en `Estudiante`). |
| **Gestión y Registro de Docentes** | `Usuario`, `Docente` | **INCOMPLETO** | `Docente` carece de nombres, apellidos, correo y especialidad. |
| **Gestión de Cursos y Ciclos** | `Curso`, `CicloAcademico` | **PARCIAL** | Faltan fechas de inicio/fin en `CicloAcademico` y horas en `Curso`. |
| **Creación de Grupos y Control de Cupos** | `Grupo`, `Curso`, `Docente` | **INCOMPLETO** | `Grupo` no tiene `capacidad` ni relación foránea con `CicloAcademico`. |
| **Programación y Consulta de Horarios** | `Horario`, `Grupo` | **PARCIAL** | Estructura funcional pero carece de restricciones contra solapamientos. |
| **Matrícula y Verificación de Aforo** | `Matricula`, `Estudiante`, `Grupo`, `CicloAcademico` | **PARCIAL** | Falta `capacidad` en `Grupo` para validar aforo y `UNIQUE` en `Matricula`. |
| **Registro y Control de Pagos** | `Pago`, `Matricula` | **PARCIAL** | Falta `fecha_vencimiento` para cuotas pendientes. |
| **Toma y Cierre de Asistencia** | `SesionAsistencia`, `DetalleAsistencia`, `Grupo`, `Estudiante` | **COMPLETO** | Estructura 100% compatible con las reglas del sistema. |
| **Evaluaciones, Calificación y Publicación** | `EvaluacionNotas`, `DetalleNota`, `Grupo`, `Estudiante` | **COMPLETO** | Totalmente compatible; requiere `CHECK(valor_nota BETWEEN 0 AND 20)`. |
| **Portal del Estudiante (Consulta Integral)** | `Estudiante`, `Matricula`, `Grupo`, `Curso`, `Horario`, `SesionAsistencia`, `DetalleAsistencia`, `EvaluacionNotas`, `DetalleNota`, `Pago` | **COMPLETO** | Todas las relaciones permiten reconstruir la vista del alumno por curso. |

---

## 8. ANÁLISIS DEL MODELO DE FIGMA (PROTOTIPO VISUAL Y UX)

Se realizó una inspección detallada del prototipo interactivo contenido en la carpeta `Sistema de Gestión Académica` (`app.js`, `index.html`, `styles.css`).

### 8.1. Pantallas y Vistas Analizadas por Rol

#### Vistas del Administrador
- `dashboard`: Indicadores globales (Estudiantes, Docentes, Cursos, Grupos, Pagos pendientes) y tablas de matrículas/pagos recientes.
- `users`: Listado de usuarios con modal para crear/editar usuarios y asignar rol (`Administrador`, `Administrativo`, `Docente`, `Estudiante`).
- `teachers`: Listado de docentes con modal de alta (Nombre, Especialidad, Correo, Estado).
- `courses`: Catálogo de cursos con código, nombre, horas semanales y estado.
- `cycles`: Listado de ciclos académicos con fechas de inicio, fin y estados.
- `groups`: Listado de grupos con curso, código, docente, capacidad, aula y estado.
- `schedules`: Horarios asignados por día, hora y aula.
- `attendance`: Vista de supervisión de asistencia por grupo con estado de última sesión (Abierta/Cerrada).
- `grades`: Vista de evaluaciones con opción de acceder al detalle y botón "Habilitar edición" para reabrir evaluaciones publicadas.

#### Vistas del Personal Administrativo
- `dashboard`: Métricas de estudiantes, matrículas activas, pagos pendientes y operaciones recientes.
- `students`: Padrón de estudiantes con modal de registro/edición.
- `student-detail`: Vista profunda del estudiante con pestañas de Resumen, Matrículas, Historial de Pagos y Rendimiento (Asistencia y Promedio).
- `enrollments`: Listado de matrículas y formulario de "Nueva Matrícula" con selector dinámico de curso, grupo y cálculo visual de vacantes disponibles en tiempo real.
- `payments`: Historial de pagos, modal para registrar nuevos cobros y acción de anulación auditada ("Anular pago").
- `queries`: Accesos rápidos a reportes de alumnos, matrículas y estados de cuenta.

#### Vistas del Docente
- `dashboard`: Resumen de grupos asignados, clases de la fecha, evaluaciones pendientes en borrador y accesos rápidos.
- `my-groups`: Tarjetas de cursos asignados con conteo de inscritos, horario y aula.
- `group-detail`: Nómina de estudiantes del grupo con accesos directos a Asistencia y Evaluaciones.
- `attendance`: Selector de grupo y fecha; tabla interactiva de alumnos con selectores (`Presente`, `Tardanza`, `Ausente`), botón "Guardar asistencia" (borrador) y botón "Cerrar asistencia" (bloqueo definitivo).
- `evaluaciones` y `evaluation-detail`: Creación de evaluaciones; tabla de notas numéricas; estados `Borrador` y `Publicada`; bloqueo automático de inputs si la evaluación está publicada.
- `my-schedule`: Cronograma semanal de clases del docente.

#### Vistas del Estudiante
- `dashboard`: Resumen de matrícula activa, conteo de cursos, próximas clases y pagos pendientes.
- `my-enrollment`: Detalle de constancia de matrícula (código, ciclo, materias, docentes).
- `my-courses`: Listado de asignaturas matriculadas representadas como tarjetas independientes.
- `course-detail`: Vista estructurada por curso con 3 pestañas:
  - *Información:* Docente, horario, aula, ciclo.
  - *Asistencia:* Resumen numérico (Clases, Presentes, Tardanzas, Ausencias) y tabla detallada por fecha.
  - *Notas:* Promedio general del curso y desglose de notas **únicamente de evaluaciones publicadas**.
- `my-schedule`: Horario semanal de clases del alumno.
- `my-payments`: Cronograma de cuotas y conceptos con estado (`Pagado` / `Pendiente`).

---

### 8.2. Hallazgos Críticos, Incoherencias de UX y Discrepancias Detectadas en Figma

1. **Discrepancia en la Creación de Cuentas de Estudiantes:**
   - *En Figma:* En la vista de Estudiantes (`renderStudents`), el modal `openStudentModal` únicamente solicita datos de perfil (`firstName`, `lastName`, `dni`, `phone`, `email`). En ningún lugar solicita contraseña o nombre de usuario. Paralelamente, en la vista de Usuarios (`renderUsers`), el Administrador tiene la opción de crear usuarios con rol `Estudiante`.
   - *Contradicción con Documentación:* `Documentacion.txt` establece explícitamente que el Administrador **no** crea estudiantes y que el Personal Administrativo **debe crear la cuenta de usuario del alumno en el mismo proceso de registro de admisiones**.
   - *Solución UX:* Ajustar el flujo en la UI del Personal Administrativo para que el formulario de "Nuevo Estudiante" incluya la generación/configuración de credenciales de acceso (username y password), eliminando el rol `Estudiante` del modal de usuarios del Administrador.

2. **Desconexión entre Registro de Matrícula y Cobro Inicial:**
   - *En Figma:* Al registrar una matrícula en `enrollment-form`, al finalizar se muestra un modal de éxito con un botón "Registrar pago" que redirige manualmente al modal de pagos.
   - *Optimización recomendada:* Integrar en un solo paso opcional: "Registrar Matrícula con Pago Inicial Inmediato" para agilizar la atención en ventanilla.

3. **Consistencia de Permisos en Tablas y Acciones:**
   - *En Figma:* El prototipo permite cambiar de rol mediante un selector superior (`role-switch`). Se validó que las acciones de edición de cursos/ciclos/horarios están correctamente ocultas para el rol Administrativo, y que el docente solo tiene acceso a sus propios grupos.

---

## 9. ANÁLISIS DE LA ESTRUCTURA DEL PROYECTO

### 9.1. Evaluación del Estado Actual
- El archivo `Estructurado.txt` en el espacio de trabajo se encuentra vacío (0 bytes).
- El directorio `Sistema de Gestión Académica` contiene un prototipo cliente monolítico en Vite con Vanilla JS/Tailwind.
- Para la fase de desarrollo real, se requiere establecer una estructura técnica profesional, desacoplada, mantenible y organizada por **dominios funcionales y responsabilidades por capas**, evitando el antipatrón de crear carpetas aisladas por cada tabla de base de datos.

### 9.2. Principios de Organización Técnica
1. **Separación de Responsabilidades:** Clara división entre Presentación (Frontend SPA), Enrutamiento/Validación (Controladores), Reglas de Negocio (Servicios), Acceso a Datos (Repositorios) y Persistencia (Base de Datos).
2. **Modularidad por Dominio:** Agrupar la lógica de negocio por módulos coherentes (`auth`, `estudiantes`, `academico`, `matriculas`, `asistencia`, `evaluaciones`, `pagos`).
3. **Control Centralizado de Errores y Validaciones:** Middlewares dedicados a capturar excepciones, validar esquemas de entrada (DTOs) y autenticar/autorizar mediante tokens JWT.

---

## 10. ARQUITECTURA PROPUESTA

```
+-------------------------------------------------------------------------+
|                          ARQUITECTURA EN CAPAS                          |
+-------------------------------------------------------------------------+
|                                                                         |
|  [CAPA DE PRESENTACIÓN] (Frontend SPA)                                  |
|  - React 19 + TypeScript + CSS / Tailwind                               |
|  - Gestión de Estado, Enrutamiento y Guards de Navegación               |
|  - Cliente HTTP con Interceptores (Manejo de Tokens JWT)                |
|                               |                                         |
|                               v  (HTTPS / JSON REST API)                |
|                                                                         |
|  [CAPA DE API Y RUTAS] (Backend HTTP Entrypoint)                        |
|  - Middlewares Globales (CORS, Rate Limit, Error Handler)               |
|  - Middlewares de Seguridad (Auth JWT, Role Guard)                      |
|  - Enrutadores por Dominio (/api/auth, /api/matriculas, etc.)           |
|                               |                                         |
|                               v                                         |
|                                                                         |
|  [CAPA DE CONTROLADORES] (HTTP Handlers)                                |
|  - Extracción de Parámetros, Query y Body                               |
|  - Validación de Esquemas DTO (Tipos y Requisitos)                      |
|  - Invocación de Servicios y Mapeo de Códigos HTTP (200, 201, 400, etc.)|
|                               |                                         |
|                               v                                         |
|                                                                         |
|  [CAPA DE SERVICIOS] (Lógica de Negocio y Dominio)                      |
|  - Validación de Reglas de Negocio (Aforos, Solapamientos, Fechas)      |
|  - Orquestación de Transacciones Atómicas (Multi-repositorio)           |
|  - Hash de Contraseñas, Cálculos de Promedios y Bloqueos de Estado      |
|                               |                                         |
|                               v                                         |
|                                                                         |
|  [CAPA DE REPOSITORIOS] (Acceso a Datos)                                |
|  - Abstracción de Persistencia (Queries SQL Parametrizadas)             |
|  - Operaciones CRUD y Consultas de Agregación Complejas                 |
|  - Mapeo de Entidades Relacionales a Objetos de Dominio                 |
|                               |                                         |
|                               v  (Conexión BD Pool / Transacciones)     |
|                                                                         |
|  [CAPA DE PERSISTENCIA] (Base de Datos Relacional)                      |
|  - Motor MySQL / MariaDB / PostgreSQL                                   |
|  - Integridad Referencial Estricta (PK, FK, Unique, Check)              |
|                                                                         |
+-------------------------------------------------------------------------+
```

### 10.1. Responsabilidades Detalladas por Capa

1. **Frontend (SPA):**
   - Renderiza la interfaz gráfica, dashboards, formularios y tablas.
   - Aplica validaciones visuales de formulario antes del envío.
   - Administra el estado de la sesión activa y adapta el menú según el rol.
   - Protege rutas mediante guardias de cliente (aunque la seguridad real reside en el backend).

2. **Controladores (Controllers):**
   - Reciben las solicitudes HTTP (`req`, `res`).
   - Validan la presencia y formato de los datos de entrada (Data Transfer Objects).
   - No contienen lógica de negocio ni sentencias SQL.
   - Delegan el procesamiento al Servicio correspondiente y devuelven respuestas HTTP estandarizadas.

3. **Servicios (Services):**
   - Núcleo de la lógica de negocio del sistema.
   - Verifican reglas: ¿Hay vacantes en el grupo? ¿El docente tiene cruce de horario? ¿La evaluación ya está publicada?
   - Manejan transacciones compuestas (ejemplo: crear `Usuario` + crear `Estudiante` en un único bloque transaccional).
   - Lanzan excepciones de negocio con mensajes claros cuando una regla es violada.

4. **Repositorios (Repositories):**
   - Responsables exclusivos de ejecutar las consultas contra el motor de base de datos.
   - Utilizan sentencias preparadas y parametrizadas para evitar vulnerabilidades de inyección SQL.
   - Retornan estructuras de datos limpias a la capa de servicios.

5. **Base de Datos (Database):**
   - Garantiza la persistencia, consistencia ACID y la integridad referencial de todas las entidades.

---

## 11. AUTENTICACIÓN Y AUTORIZACIÓN

```
+-----------------------------------------------------------------------------+
|                     MECANISMO DE SEGURIDAD Y TOKENS                         |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [CLIENTE]                                [BACKEND]                         |
|     |                                         |                             |
|     |  1. POST /api/auth/login                |                             |
|     |     { username, password }              |                             |
|     |---------------------------------------->|  2. Busca usuario en BD     |
|     |                                         |  3. Compara hash (Argon2/   |
|     |                                         |     Bcrypt)                 |
|     |                                         |  4. Valida estado ACTIVO    |
|     |  5. HTTP 200 { token_jwt, user_info }   |  5. Genera JWT firmado      |
|     |<----------------------------------------|     con { id, rol }         |
|     |                                         |                             |
|     |  6. Almacena Token                      |                             |
|     |                                         |                             |
|     |  7. Request con Header:                 |                             |
|     |     Authorization: Bearer <token>       |                             |
|     |---------------------------------------->|  8. Middleware Auth:        |
|     |                                         |     - Verifica firma JWT    |
|     |                                         |     - Inyecta req.user      |
|     |                                         |  9. Middleware RoleGuard:   |
|     |                                         |     - Verifica req.user.rol |
|     |                                         |     - Si no coincide:       |
|     |  10. HTTP 403 Forbidden                 |       Retorna HTTP 403      |
|     |<----------------------------------------|                             |
|     |                                         |                             |
+-----------------------------------------------------------------------------+
```

### 11.1. Especificación de Autenticación
- **Identificador de Acceso:** `nombre_usuario` único (o correo institucional).
- **Protección de Contraseñas:** Algoritmo de hash criptográfico robusto (`Bcrypt` con salt rounds >= 10 o `Argon2id`). Prohibido terminantemente el almacenamiento en texto plano o MD5/SHA1.
- **Mecanismo de Sesión:** Tokens de Acceso JSON Web Tokens (JWT) firmados con clave secreta asimétrica o secreta de alta entropía, con tiempo de expiración definido (ej: 8 horas).
- **Cierre de Sesión (Logout):** Eliminación del token en el cliente y soporte opcional para lista negra de tokens revocados en servidor.

### 11.2. Especificación de Autorización (Control de Acceso en Backend)
- **Principio de Mínimo Privilegio:** Ningún endpoint confía en el frontend. Aunque el frontend oculte un botón, cada ruta de la API está protegida por un middleware de rol.
- **Capas de Middlewares de Seguridad:**
  - `authenticateToken`: Extrae y valida el JWT del encabezado `Authorization: Bearer <token>`. Inyecta el payload (`userId`, `role`) en el contexto del request (`req.user`).
  - `requireRole(['ADMINISTRADOR', 'ADMINISTRATIVO'])`: Comprueba que el rol del usuario autenticado coincida con los roles autorizados para el endpoint. Si no coincide, interrumpe la petición con `HTTP 403 Forbidden`.
- **Filtros de Propiedad y Aislamiento de Datos (Data Isolation):**
  - Si un usuario tiene rol `DOCENTE`, los servicios automáticamente restringen las consultas a `docente_id = req.user.docenteId`.
  - Si un usuario tiene rol `ESTUDIANTE`, los servicios automáticamente restringen las consultas a `estudiante_id = req.user.estudianteId`.

---

## 12. VALIDACIONES Y REGLAS DE NEGOCIO

### 12.1. Reglas de Negocio Existentes y Validadas

| Código | Regla de Negocio | Justificación / Fuente |
| :--- | :--- | :--- |
| **RN-01** | Cada usuario debe tener un único rol asignado y solo puede acceder a las funciones autorizadas para ese rol. | `Documentacion.txt` (Regla 1) |
| **RN-02** | Las cuentas de usuario no se eliminan físicamente; se activan o desactivan para preservar la trazabilidad histórica. | `Documentacion.txt` (Regla 2) |
| **RN-03** | El Administrador del Sistema gestiona cuentas de Admin, Administrativo y Docente. **No crea cuentas de estudiantes**. | `Documentacion.txt` (Cap. 3 y 15) |
| **RN-04** | El Personal Administrativo registra al estudiante y **crea su cuenta de acceso en el mismo proceso**. | `Documentacion.txt` (Regla 3) |
| **RN-05** | Si un estudiante ya está registrado, no se le debe crear una segunda cuenta al volver a matricularlo. | `Documentacion.txt` (Regla 3) |
| **RN-06** | Una matrícula confirmada no se elimina; su estado pasa a `CANCELADA` o `RETIRADA`. | `Documentacion.txt` (Regla 4) |
| **RN-07** | No se permite matricular a un estudiante en un grupo cuya capacidad esté completa (`matriculas_activas >= capacidad`). | `Documentacion.txt` (Cap. 4 y 20) |
| **RN-08** | No se permite matricular a un estudiante dos veces en el mismo grupo durante el mismo ciclo. | Regla de integridad académica |
| **RN-09** | Los pagos registrados no se eliminan físicamente; si hay un error, se marcan como `ANULADO`. | `Documentacion.txt` (Regla 5) |
| **RN-10** | Un docente no puede tener dos grupos asignados en el mismo horario y día (conflicto de horario docente). | `Documentacion.txt` (Cap. 19) |
| **RN-11** | Un aula física no puede ser utilizada por dos grupos distintos en el mismo horario y día (conflicto de aula). | `Documentacion.txt` (Cap. 19) |
| **RN-12** | El Docente solo puede gestionar asistencia y notas de los grupos que tiene formalmente asignados. | `Documentacion.txt` (Regla 10) |
| **RN-13** | La sesión de asistencia solo puede modificarse mientras su estado sea `ABIERTA`. Al pasar a `CERRADA`, queda bloqueada. | `Documentacion.txt` (Regla 6) |
| **RN-14** | El Docente debe crear una evaluación antes de registrar calificaciones. | `Documentacion.txt` (Regla 7) |
| **RN-15** | Las notas se pueden modificar solo mientras la evaluación esté en estado `BORRADOR`. | `Documentacion.txt` (Regla 8) |
| **RN-16** | Al publicar una evaluación (`PUBLICADA`), las notas quedan bloqueadas para el docente y pasan a ser visibles para los alumnos. | `Documentacion.txt` (Regla 8) |
| **RN-17** | La reapertura de una evaluación publicada a estado `BORRADOR` solo puede ser realizada por el Administrador del Sistema. | `Documentacion.txt` (Cap. 7) |
| **RN-18** | La escala de calificación es estrictamente vigesimal (`0.00` a `20.00`). | Prototipo y Documentación |
| **RN-19** | El estudiante solo puede consultar su propia información académica, asistencias, notas publicadas y pagos. | `Documentacion.txt` (Regla 9) |
| **RN-20** | La asistencia y las notas del estudiante se deben estructurar y visualizar organizadas por curso. | `Documentacion.txt` (Regla 11) |

---

### 12.2. Reglas de Negocio que Deberían Definirse Formalmente [POR DEFINIR]

1. **RND-01: Política de Tolerancia y Horas de Tardanza:**
   - *Situación actual:* Existen estados `PRESENTE`, `TARDANZA` y `AUSENTE`, pero no se define a partir de cuántos minutos se considera tardanza ni cuántas tardanzas equivalen a una inasistencia injustificada.
   - *Definición pendiente:* Establecer si la tardanza es un registro cualitativo discrecional del profesor o si requiere conteo de minutos y regla de equivalencia a falta.

2. **RND-02: Algoritmo de Promedio Final de Curso:**
   - *Situación actual:* Se aplica promedio aritmético simple de las evaluaciones publicadas.
   - *Definición pendiente:* Definir si en versiones futuras se implementará ponderación por pesos (ej: Examen Final 40%, Prácticas 60%) o si se mantendrá permanentemente el promedio simple.

3. **RND-03: Restricción de Matrícula por Morosidad:**
   - *Situación actual:* El sistema permite matricular alumnos recurrentes sin verificar si mantienen cuotas con estado `PENDIENTE` de ciclos anteriores.
   - *Definición pendiente:* Decidir si el sistema debe bloquear automáticamente la nueva matrícula de alumnos con deudas pendientes o si queda a criterio del administrativo con una alerta visual.

4. **RND-04: Política de Generación de Username y Contraseña Inicial:**
   - *Situación actual:* En Figma se usa password genérico `123456`.
   - *Definición pendiente:* Establecer estándar institucional (ej: username = DNI o inicial del nombre + apellido; password temporal = DNI del alumno obligando a cambio en primer inicio).

---

## 13. ESTADOS DEL SISTEMA Y DIAGRAMAS DE TRANSICIÓN

### 13.1. Transición de Estados por Entidad

```
1. USUARIO / DOCENTE / CURSO / ESTUDIANTE:
   [ ACTIVO ]  <===============>  [ INACTIVO ]
   (Permite operar)              (Bloquea acceso y selección; conserva histórico)
   * Transición por: Administrador (personal) / Administrativo (estudiantes).

2. MATRÍCULA:
   [ ACTIVA ]  --------------->  [ RETIRADA ]  (Estudiante abandona el curso formalmente)
       |
       +----------------------->  [ CANCELADA ] (Anulación de inscripción por error/fuerza mayor)
   * Transición por: Personal Administrativo.
   * Condición: Registro histórico inmutable (no se borra).

3. PAGO:
   [ PENDIENTE ] ------------->  [ PAGADO ]    (Se confirma recepción de dinero)
       |                            |
       |                            +---------> [ ANULADO ] (Reversa justificada de operación)
       v
   [ ANULADO ] (Cobro cancelado)
   * Transición por: Personal Administrativo.
   * Condición: Transacción auditada; monto anulado se descuenta de caja.

4. SESIÓN DE ASISTENCIA:
   [ ABIERTA ]  -------------->  [ CERRADA ]
   (Docente edita registros)    (Registros congelados; edición bloqueada)
   * Transición por: Docente responsable del grupo.

5. EVALUACIÓN Y CALIFICACIONES:
   [ BORRADOR ]  ------------->  [ PUBLICADA ]
   (Docente ingresa notas;      (Notas visibles para alumnos; docente bloqueado)
    invisible a alumnos)              |
         ^                            |
         +----------------------------+
            (Solo Administrador reabre)
   * Transición a Publicada: Docente.
   * Transición a Borrador: Administrador del Sistema (Rectificación).

6. CICLO ACADÉMICO:
   [ PLANIFICADO ] ----------->  [ ACTIVO ] -----------> [ FINALIZADO ]
   (Configuración de grupos)   (Matrículas y clases)    (Cierre de actas)
   * Transición por: Administrador del Sistema.
```

---

## 14. PROBLEMAS, CONTRADICCIONES Y RIESGOS

### 14.1. Clasificación de Problemas Encontrados

#### PROBLEMAS CRÍTICOS (Deben corregirse antes de programar)

1. **Problema Crítico 1: Pérdida de Información de Identidad en Usuarios y Docentes**
   - *Archivos involucrados:* `Base de datos de la academia.txt` (Tablas `Usuario` y `Docente`).
   - *Causa:* La tabla `Usuario` solo tiene `nombre_usuario`, `password_hash`, `rol` y `estado`. La tabla `Docente` solo tiene `usuario_id`, `codigo_docente`, `dni`, `telefono`. Ninguna tabla almacena los `nombres`, `apellidos` ni `correo` de los docentes, administradores o secretarias.
   - *Impacto:* El sistema no puede mostrar el nombre real del profesor en listas, horarios o actas de notas, ni el nombre del personal administrativo.
   - *Solución propuesta:* Modificar la base de datos para agregar `nombres`, `apellidos`, `correo` y `especialidad` en la tabla `Docente`, y agregar `nombres`, `apellidos`, `correo` en la tabla `Usuario` (o crear una tabla `Personal`).

2. **Problema Crítico 2: Falta de Capacidad de Alumnos y Ciclo en la Tabla Grupo**
   - *Archivos involucrados:* `Base de datos de la academia.txt` (Tabla `Grupo`).
   - *Causa:* La tabla `Grupo` no contiene la columna `capacidad INT` ni la clave foránea `ciclo_id`.
   - *Impacto:* Es imposible que el backend valide el límite de vacantes al matricular, y los grupos quedan huérfanos de ciclo académico, generando desalineación con la tabla `Matricula`.
   - *Solución propuesta:* Agregar las columnas `ciclo_id INT NOT NULL REFERENCES CicloAcademico(id)` y `capacidad INT NOT NULL DEFAULT 30` en la tabla `Grupo`.

3. **Problema Crítico 3: Desconexión en la Creación de Cuentas de Estudiantes entre Figma y Documentación**
   - *Archivos involucrados:* Prototipo Figma (`app.js`), `Documentacion.txt`.
   - *Causa:* En Figma, el modal de nuevo estudiante no solicita credenciales, mientras que el Administrador tiene un modal de usuarios donde erróneamente se le permite crear estudiantes.
   - *Impacto:* Si se programa copiando la UI de Figma, se violará la Regla 3 de la documentación y los estudiantes no tendrán forma de acceder sin una doble tarea administrativa.
   - *Solución propuesta:* Corregir el flujo en la interfaz de admisiones para que el formulario de creación de estudiante genere simultáneamente el registro en `Usuario` y `Estudiante`.

---

#### PROBLEMAS IMPORTANTES (Causarán modificaciones y reprocesos si no se resuelven)

4. **Problema Importante 1: Falta de Restricción de Unicidad en Matrículas por Ciclo**
   - *Archivos involucrados:* `Base de datos de la academia.txt` (Tabla `Matricula`).
   - *Causa:* No existe restricción `UNIQUE (estudiante_id, grupo_id, ciclo_id)`.
   - *Impacto:* Un doble clic o error de red puede generar matrículas duplicadas para el mismo alumno en el mismo curso.
   - *Solución propuesta:* Agregar restricción `UNIQUE` en la definición de la tabla `Matricula` y validación preventiva en el servicio de backend.

5. **Problema Importante 2: Falta de Fechas y Estados en Ciclos Académicos**
   - *Archivos involucrados:* `Base de datos de la academia.txt` (Tabla `CicloAcademico`).
   - *Causa:* Solo posee `nombre` y `estado ENUM('ACTIVO','INACTIVO')`.
   - *Impacto:* No se puede saber cuándo inicia o termina un ciclo, ni planificar ciclos futuros (`PLANIFICADO`, `FINALIZADO`).
   - *Solución propuesta:* Añadir `fecha_inicio DATE`, `fecha_fin DATE` y ampliar los estados a `'PLANIFICADO', 'ACTIVO', 'FINALIZADO'`.

6. **Problema Importante 3: Inconsistencia en la Tabla Pagos para Cuotas Pendientes**
   - *Archivos involucrados:* `Base de datos de la academia.txt` (Tabla `Pago`).
   - *Causa:* El campo `fecha` se inicializa por defecto al momento del insert y no existe `fecha_vencimiento`.
   - *Impacto:* Cuando se crea un pago pendiente o cronograma, la fecha registrada se confunde con la fecha de pago real.
   - *Solución propuesta:* Dividir en `fecha_vencimiento DATE` y `fecha_pago DATETIME NULL`.

---

#### MEJORAS (Optimizaciones no bloqueantes)

7. **Mejora 1: Tabla Independiente de Aulas**
   - *Archivos involucrados:* `Base de datos de la academia.txt` (Tabla `Horario`).
   - *Causa:* `aula` es un campo de texto libre `VARCHAR(50)`.
   - *Impacto:* Posibles inconsistencias tipográficas (ej: "Aula 101" vs "aula-101").
   - *Solución propuesta:* Mantener validación estandarizada en backend o crear catálogo de aulas con aforo físico.

8. **Mejora 2: Registro de Auditoría para Reapertura de Calificaciones y Anulación de Pagos**
   - *Archivos involucrados:* Lógica general de backend.
   - *Solución propuesta:* Registrar en logs o tabla de auditoría: `usuario_id`, `fecha`, `accion`, `justificacion` cada vez que se reabra una evaluación o se anule un pago.

---

## 15. DECISIONES RECOMENDADAS ANTES DE PROGRAMAR

A continuación se lista el estado de cada decisión técnica y funcional clave:

- **[DEFINIDA] Separación de Roles en 4 Perfiles Únicos:** Administrador, Personal Administrativo, Docente, Estudiante.
- **[DEFINIDA] Provisión de Cuenta de Estudiante:** La cuenta es creada exclusivamente por el Personal Administrativo durante el registro del alumno.
- **[DEFINIDA] Ciclo de Vida de Evaluaciones:** Flujo estricto `Borrador -> Publicada` y reapertura exclusiva por el Administrador.
- **[DEFINIDA] Inmutabilidad Financiera:** Pagos y matrículas no se eliminan físicamente; se gestionan mediante transiciones de estado (`ANULADO`, `CANCELADA`, `RETIRADA`).
- **[DEFINIDA] Control de Asistencia por Sesión:** Registro por fecha con estados `PRESENTE`, `TARDANZA`, `AUSENTE` y congelamiento al pasar a estado `CERRADA`.
- **[REQUIERE CAMBIO] Modelo de Datos de Docentes:** Añadir `nombres`, `apellidos`, `correo`, `especialidad` a `Docente`.
- **[REQUIERE CAMBIO] Modelo de Datos de Grupos:** Añadir `ciclo_id` y `capacidad` a `Grupo`.
- **[REQUIERE CAMBIO] Modelo de Datos de Ciclos:** Añadir `fecha_inicio`, `fecha_fin` y estados `PLANIFICADO`, `ACTIVO`, `FINALIZADO` a `CicloAcademico`.
- **[REQUIERE CAMBIO] Restricción de Unicidad en Matrícula:** Agregar `UNIQUE(estudiante_id, grupo_id, ciclo_id)`.
- **[REQUIERE CAMBIO] Flujo de UI de Nuevo Estudiante en Figma:** Integrar campos de credenciales de usuario en el modal de registro de estudiantes.
- **[POR DEFINIR] Política de Tolerancia para Tardanzas:** Definir si se cuantifican minutos o solo marca cualitativa.
- **[POR DEFINIR] Formato Institucional de Credenciales:** Definir regla de nomenclatura para `nombre_usuario` y contraseña inicial de estudiantes.
- **[POR DEFINIR] Política de Bloqueo por Deuda:** Decidir si deudas anteriores bloquean la matrícula en nuevos ciclos de forma automática.

---

## 16. MATRIZ DE TRAZABILIDAD INTEGRAL

| Funcionalidad del Sistema | Pantalla / Vista en Figma | Rol Principal | Tablas BD Involucradas | Componente Backend | Estado de Coherencia |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Autenticación y Login** | `login-page` | Todos | `Usuario` | `AuthController`, `AuthService`, `UserRepository` | Coherente tras corregir datos de identidad |
| **Gestión de Personal** | `users` | Admin | `Usuario` | `UserController`, `UserService`, `UserRepository` | Coherente |
| **Registro de Estudiante y Cuenta** | `students` (modal nuevo) | Administrativo | `Usuario`, `Estudiante` | `StudentController`, `StudentService`, `StudentRepository` | Requiere sincronizar UI de Figma |
| **Consulta Expediente Estudiante** | `student-detail` | Admin, Staff | `Estudiante`, `Matricula`, `Pago`, `DetalleAsistencia`, `DetalleNota` | `StudentController`, `StudentQueryService` | Coherente |
| **Gestión de Docentes** | `teachers` | Admin | `Usuario`, `Docente` | `TeacherController`, `TeacherService` | Requiere campos de nombres en BD |
| **Gestión de Cursos** | `courses` | Admin | `Curso` | `CourseController`, `CourseService` | Coherente |
| **Gestión de Ciclos** | `cycles` | Admin | `CicloAcademico` | `CycleController`, `CycleService` | Requiere campos de fechas en BD |
| **Gestión de Grupos** | `groups` | Admin | `Grupo`, `Curso`, `Docente`, `CicloAcademico` | `GroupController`, `GroupService` | Requiere capacidad y ciclo_id en BD |
| **Programación de Horarios** | `schedules` | Admin | `Horario`, `Grupo` | `ScheduleController`, `ScheduleService` | Coherente con validación anti-cruce |
| **Registro de Matrícula** | `enrollments` (form nueva) | Administrativo | `Matricula`, `Estudiante`, `Grupo`, `CicloAcademico` | `EnrollmentController`, `EnrollmentService` | Coherente |
| **Registro y Anulación de Pagos** | `payments` | Administrativo | `Pago`, `Matricula` | `PaymentController`, `PaymentService` | Coherente |
| **Toma y Cierre de Asistencia** | `attendance` (docente) | Docente | `SesionAsistencia`, `DetalleAsistencia`, `Grupo` | `AttendanceController`, `AttendanceService` | 100% Coherente |
| **Creación de Evaluaciones** | `evaluations` | Docente | `EvaluacionNotas`, `Grupo` | `EvaluationController`, `EvaluationService` | 100% Coherente |
| **Registro de Notas** | `evaluation-detail` | Docente | `DetalleNota`, `EvaluacionNotas` | `GradeController`, `GradeService` | 100% Coherente |
| **Reapertura de Evaluación** | `evaluation-detail` (admin) | Admin | `EvaluacionNotas` | `EvaluationController`, `EvaluationService` | 100% Coherente |
| **Portal Alumno: Mis Cursos** | `my-courses`, `course-detail` | Estudiante | `Matricula`, `Grupo`, `Curso`, `Docente` | `StudentPortalController`, `StudentPortalService` | 100% Coherente |
| **Portal Alumno: Mi Asistencia** | `my-attendance`, `course-detail` | Estudiante | `SesionAsistencia`, `DetalleAsistencia` | `StudentPortalController`, `StudentPortalService` | 100% Coherente |
| **Portal Alumno: Mis Notas** | `my-grades`, `course-detail` | Estudiante | `EvaluacionNotas`, `DetalleNota` | `StudentPortalController`, `StudentPortalService` | 100% Coherente (solo publicadas) |
| **Portal Alumno: Mis Pagos** | `my-payments` | Estudiante | `Pago`, `Matricula` | `StudentPortalController`, `StudentPortalService` | 100% Coherente |

---

## 17. DOCUMENTACIÓN FINAL PROPUESTA (VERSIÓN CONSOLIDADA Y CORREGIDA)

### 17.1. Modelo Conceptual de Datos Corregido

A continuación se resume la estructura relacional recomendada que resuelve todas las discrepancias detectadas:

```
+-------------------------------------------------------------------------------+
|                      ESTRUCTURA RELACIONAL CORREGIDA                          |
+-------------------------------------------------------------------------------+
| 1. Usuario (id, nombre_usuario, password_hash, rol, estado, nombres,          |
|             apellidos, correo)                                                |
| 2. Estudiante (id, usuario_id [FK-UQ], codigo_estudiante [UQ], nombres,      |
|                apellidos, dni [UQ], fecha_nacimiento, telefono, correo,      |
|                direccion, estado)                                             |
| 3. Docente (id, usuario_id [FK-UQ], codigo_docente [UQ], nombres, apellidos,  |
|             dni [UQ], especialidad, telefono, correo, estado)                 |
| 4. Curso (id, codigo_curso [UQ], nombre, descripcion, horas_semanales, estado)|
| 5. CicloAcademico (id, nombre, fecha_inicio, fecha_fin, estado)               |
| 6. Grupo (id, ciclo_id [FK], curso_id [FK], docente_id [FK], nombre_grupo,    |
|           capacidad, aula_base, estado)                                       |
| 7. Horario (id, grupo_id [FK], dia_semana, hora_inicio, hora_fin, aula)       |
| 8. Matricula (id, codigo_matricula [UQ], estudiante_id [FK], grupo_id [FK],   |
|               ciclo_id [FK], estado, fecha_registro,                          |
|               UQ(estudiante_id, grupo_id, ciclo_id))                          |
| 9. Pago (id, matricula_id [FK], concepto, monto, fecha_vencimiento,           |
|          fecha_pago, metodo_pago, estado, comprobante)                        |
| 10. SesionAsistencia (id, grupo_id [FK], fecha, estado,                       |
|                       UQ(grupo_id, fecha))                                    |
| 11. DetalleAsistencia (id, sesion_asistencia_id [FK], estudiante_id [FK],     |
|                        estado_asistencia,                                     |
|                        UQ(sesion_asistencia_id, estudiante_id))               |
| 12. EvaluacionNotas (id, grupo_id [FK], nombre_evaluacion, fecha, estado)     |
| 13. DetalleNota (id, evaluacion_id [FK], estudiante_id [FK], valor_nota,      |
|                  UQ(evaluacion_id, estudiante_id),                            |
|                  CHECK(valor_nota >= 0.00 AND valor_nota <= 20.00))           |
+-------------------------------------------------------------------------------+
```

---

## 18. PLAN PARA LA SIGUIENTE ETAPA (HOJA DE RUTA DE DESARROLLO)

Para iniciar el desarrollo del sistema de forma ordenada, segura y eficiente, se recomienda seguir estrictamente el siguiente plan de 10 etapas consecutivas:

```
  [1. Cierre de Decisiones] ---> [2. Definición del Esquema BD]
              |                                 |
              v                                 v
  [3. Scaffolding Arquitectura] -> [4. Configuración BD y Pool]
              |                                 |
              v                                 v
  [5. Módulo Auth y Tokens] -----> [6. Módulos Base (Usuarios/Cursos)]
              |                                 |
              v                                 v
  [7. Módulos Transaccionales] --> [8. Módulos Académicos (Notas/Asistencia)]
      (Matrículas y Pagos)                      |
              |                                 v
              +------------------> [9. Integración Frontend & Backend]
                                                |
                                                v
                                   [10. Pruebas End-to-End y QA]
```

### Detalle de las Etapas:

1. **Etapa 1: Cierre de Decisiones Pendientes**
   - Formalizar la política de tardanzas y la regla institucional de generación de credenciales iniciales para estudiantes.
2. **Etapa 2: Especificación Final del Modelo Físico de Base de Datos**
   - Redactar los scripts DDL con las tablas corregidas, claves foráneas, restricciones de unicidad, índices y checks.
3. **Etapa 3: Inicialización del Proyecto y Scaffolding de Arquitectura**
   - Configurar el entorno de backend (Node.js / Express o NestJS con TypeScript) y el entorno frontend (Vite + React + TypeScript + Tailwind/CSS).
   - Establecer la estructura de carpetas por capas (`routes`, `controllers`, `services`, `repositories`, `middlewares`, `types`).
4. **Etapa 4: Conexión y Migraciones de Base de Datos**
   - Configurar pool de conexiones, variables de entorno seguras y ejecutar las migraciones de base de datos con datos de prueba iniciales (seeders).
5. **Etapa 5: Implementación del Módulo de Autenticación y Autorización**
   - Desarrollar endpoints de Login, Refresh/Logout, middleware de verificación JWT y middleware de control de acceso por roles (`RoleGuard`).
6. **Etapa 6: Implementación de Módulos Maestros / Base**
   - Desarrollar CRUD y servicios de Personal, Docentes, Cursos, Ciclos Académicos, Grupos y Horarios (con validación de cruce de horarios y aulas).
7. **Etapa 7: Implementación de Módulos Transaccionales (Estudiantes, Matrículas y Pagos)**
   - Desarrollar el flujo compuesto de admisión (registro de estudiante + usuario), verificación de vacantes, matrícula atómica y registro/anulación de pagos.
8. **Etapa 8: Implementación de Módulos Académicos (Asistencia y Notas)**
   - Desarrollar la apertura y cierre de sesiones de asistencia por grupo/fecha.
   - Desarrollar la creación de evaluaciones, guardado en borrador, publicación con bloqueo para docentes y reapertura administrativa.
9. **Etapa 9: Integración Completa Frontend - Backend**
   - Conectar las vistas y formularios de la SPA con la API REST, implementando interceptores HTTP, estados de carga, alertas toast y validación visual.
10. **Etapa 10: Pruebas Integrales, Control de Calidad y Despliegue**
    - Ejecutar pruebas de regresión, validación de permisos en cada endpoint, pruebas de concurrencia en control de aforos y verificación de la experiencia de usuario en todos los roles.
