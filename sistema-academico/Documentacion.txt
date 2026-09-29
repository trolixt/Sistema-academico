# Sistema de Gestión Administrativa y Académica para Academias

## 1. Descripción general

Sistema web orientado a gestionar los principales procesos administrativos y académicos de una academia, permitiendo administrar estudiantes, matrículas, cursos, grupos, docentes, horarios, pagos, asistencia y notas.

El sistema contará con cuatro roles de usuario: Administrador del sistema, Personal Administrativo, Docente y Estudiante. Cada rol tendrá acceso únicamente a las funciones correspondientes a sus responsabilidades.

---

## 2. Roles del sistema

| Rol                       | Función principal                                                |
| ------------------------- | ---------------------------------------------------------------- |
| Administrador del sistema | Controla y configura el sistema                                  |
| Personal Administrativo   | Gestiona estudiantes, cuentas de estudiantes, matrículas y pagos |
| Docente                   | Gestiona asistencia y evaluaciones de sus grupos                 |
| Estudiante                | Consulta su información académica, matrícula y pagos             |

---

# 3. Administrador del sistema

## Función principal

El Administrador del sistema es el usuario encargado de configurar y controlar el funcionamiento general de la plataforma.

No realiza necesariamente las operaciones diarias de matrícula, registro de estudiantes o registro de pagos. Su función principal es administrar las cuentas del personal que utiliza el sistema, cursos, grupos, docentes, ciclos y horarios.
Crear otros administradores

Queda definido: SÍ.

El Administrador puede crear cuentas de:

Administrador
Personal Administrativo
Docente

También puede:

editar sus datos;
activar/desactivar cuentas;
cambiar el rol;
gestionar sus credenciales.

Eso significa que no habrá un "administrador principal" intocable. Cualquier Administrador con los permisos correspondientes puede gestionar cuentas de Administrador.

## Funciones

* Iniciar sesión.
* Gestionar cuentas de Administradores, Personal Administrativo y Docentes.
* Crear, editar, activar y desactivar cuentas del personal.
* Asignar roles a los usuarios del personal.
* Registrar y gestionar docentes.
* Gestionar cursos.
* Gestionar ciclos académicos.
* Crear y gestionar grupos.
* Asignar docentes a grupos.
* Configurar horarios y aulas.
* Consultar estudiantes.
* Consultar matrículas.
* Consultar pagos.
* Consultar asistencia.
* Consultar notas.
* Gestionar las cuentas y configuraciones básicas de los usuarios del sistema, de acuerdo con los permisos correspondientes.

**Importante:** el Administrador no será responsable de crear las cuentas de los estudiantes. La creación de la cuenta del estudiante se realizará directamente por el Personal Administrativo durante el registro del estudiante.

## Dashboard

Al iniciar sesión podrá visualizar un resumen general:

* Total de estudiantes.
* Total de docentes.
* Total de cursos.
* Grupos activos.
* Estudiantes matriculados.
* Matrículas activas.
* Pagos pendientes.
* Matrículas recientes.
* Pagos recientes.

## Flujo principal

**Configurar sistema → Crear cursos y ciclos → Crear grupos → Registrar docentes → Asignar docentes → Configurar horarios → Supervisar información**

---

# 4. Personal Administrativo

## Función principal

El Personal Administrativo es responsable de realizar las operaciones administrativas diarias de la academia, principalmente el registro de estudiantes, creación de sus cuentas de acceso, matrículas y pagos.

Este rol puede representar a una secretaria, encargado de matrículas, personal de atención o encargado de caja, sin necesidad de crear un rol diferente para cada función.

## Funciones

* Iniciar sesión.
* Registrar estudiantes.
* Crear la cuenta de acceso del estudiante durante su registro.
* Editar información de estudiantes.
* Activar o desactivar la cuenta del estudiante cuando corresponda.
* Consultar estudiantes.
* Realizar matrículas.
* Consultar matrículas.
* Registrar pagos.
* Consultar pagos.
* Consultar cursos.
* Consultar grupos disponibles.
* Consultar horarios.
* Consultar información académica de los estudiantes.
* Consultar el resumen general de asistencia de un estudiante.
* Consultar el resumen general de notas de un estudiante.

## Flujo principal

**Registrar estudiante → Crear cuenta de estudiante → Seleccionar ciclo y grupo → Registrar matrícula → Registrar pago**

## Registro del estudiante y creación de cuenta

El registro del estudiante y la creación de su cuenta de acceso se realizarán como parte de un mismo proceso.
Todo estudiante creado por el Personal Administrativo debe tener una cuenta de acceso asociada durante el mismo proceso de registro.
Cuando una persona se matricule por primera vez, el Personal Administrativo deberá:

1. Buscar al estudiante por DNI, código o nombre.
2. Si el estudiante no existe, registrar sus datos personales.
3. Crear la cuenta de acceso del estudiante.
4. Generar o establecer las credenciales de acceso correspondientes.
5. Asociar la cuenta creada con el registro del estudiante.
6. Seleccionar el ciclo académico.
7. Seleccionar el grupo disponible.
8. Verificar la disponibilidad del grupo.
9. Registrar la matrícula.
10. Generar el código de matrícula.
11. Registrar el pago correspondiente, si el estudiante realiza el pago.
12. Finalizar el registro.

De esta manera, el estudiante queda registrado, matriculado y con una cuenta que le permite acceder al sistema sin requerir un segundo proceso de creación de usuario por parte del Administrador.

## Cuenta del estudiante

La cuenta del estudiante estará vinculada directamente con su registro dentro del sistema.

La cuenta permitirá al estudiante:

* Iniciar sesión.
* Consultar sus cursos.
* Consultar su horario.
* Consultar su asistencia.
* Consultar sus notas publicadas.
* Consultar su matrícula.
* Consultar sus pagos.

El Personal Administrativo será responsable de crear esta cuenta durante el registro del estudiante.

El Administrador podrá consultar la información relacionada con los estudiantes, pero no tendrá como responsabilidad crear sus cuentas.

## Proceso de matrícula

1. Buscar al estudiante por DNI, código o nombre.
2. Asociar la cuenta con el estudiante.
3. Seleccionar el ciclo académico.
4. Seleccionar el grupo disponible.
5. Verificar la disponibilidad del grupo.
6. Registrar la matrícula.
7. Generar el código de matrícula.
8. Registrar el pago correspondiente, si el estudiante realiza el pago.
9. La matrícula queda registrada.

Si el estudiante ya se encuentra registrado, el Personal Administrativo no deberá crear una nueva cuenta. Podrá utilizar la cuenta existente y continuar con el proceso de matrícula correspondiente.

## Gestión de pagos

Los pagos estarán relacionados con una matrícula.

Una matrícula podrá tener varios pagos.

Por ejemplo:

**Matrícula M-00025**

* Pago de matrícula: S/ 150.
* Mensualidad 1: S/ 150.
* Mensualidad 2: S/ 150.
* Mensualidad 3: S/ 150.

El Personal Administrativo podrá:

* Registrar un nuevo pago.
* Seleccionar el concepto.
* Registrar el monto.
* Seleccionar el método de pago.
* Consultar pagos anteriores.
* Consultar pagos pendientes.
* Registrar la anulación de un pago cuando corresponda.

Los pagos no se eliminarán físicamente para conservar el historial.

## Consulta general del estudiante

Al consultar la información de un estudiante, el Personal Administrativo podrá visualizar un resumen de su situación académica.

### Resumen de asistencia

La asistencia se mostrará agrupada por curso.

| Curso        | Presentes | Tardanzas | Ausencias |
| ------------ | --------: | --------: | --------: |
| Matemática   |        17 |         2 |         1 |
| Física       |        18 |         1 |         1 |
| Química      |        19 |         0 |         1 |
| Comunicación |        20 |         0 |         0 |

### Resumen de notas

También podrá visualizar las notas agrupadas por curso y el promedio correspondiente.

| Curso        | Promedio |
| ------------ | -------: |
| Matemática   |     16.5 |
| Física       |     17.0 |
| Química      |     15.8 |
| Comunicación |     18.0 |

El Personal Administrativo podrá consultar el detalle de un curso cuando sea necesario.

---

# 5. Docente

## Función principal

El Docente es responsable de gestionar la información académica de los grupos que tiene asignados.

Su acceso estará limitado a sus propios cursos y grupos.

## Funciones

* Iniciar sesión.
* Consultar sus cursos.
* Consultar sus grupos.
* Consultar su horario.
* Ver los estudiantes de sus grupos.
* Registrar asistencia.
* Consultar asistencia registrada.
* Crear evaluaciones.
* Registrar notas de las evaluaciones.
* Modificar notas mientras se encuentren en borrador.
* Publicar las notas.
* Consultar las notas de sus estudiantes.

## Flujo principal

**Seleccionar grupo → Ver estudiantes → Registrar asistencia o gestionar evaluaciones y notas**

---

# 6. Gestión de asistencia

El Docente seleccionará uno de sus grupos y una fecha de clase.

El sistema mostrará únicamente los estudiantes correspondientes al grupo seleccionado.

Cada estudiante podrá tener uno de los siguientes estados:

* Presente.
* Ausente.
* Tardanza.

La asistencia tendrá dos estados:

**Abierta:** el Docente puede registrar o modificar la asistencia.

**Cerrada:** la asistencia queda bloqueada y ya no puede modificarse directamente.

## Flujo

**Seleccionar grupo → Seleccionar fecha → Ver estudiantes → Registrar asistencia → Guardar → Cerrar asistencia**

---

# 7. Gestión de evaluaciones y notas

Antes de registrar las notas, el Docente deberá crear las evaluaciones correspondientes al grupo.

Por ejemplo:

**Matemática - Grupo A**

* Examen 01.
* Examen 02.
* Práctica Calificada 01.
* Simulacro 01.
* Examen Final.

De esta manera, las notas estarán asociadas a una evaluación específica.

## Crear una evaluación

El Docente podrá crear una evaluación indicando:

* Nombre de la evaluación.
* Grupo.
* Fecha.
* Estado.

Por ejemplo:

**Evaluación:** Examen 01
**Grupo:** Matemática - A
**Fecha:** 15/03/2027
**Estado:** Borrador

Una vez creada la evaluación, el sistema mostrará la lista de estudiantes del grupo para registrar sus notas.

## Registro de notas

Ejemplo:

| Estudiante   | Nota |
| ------------ | ---: |
| Juan Pérez   |   15 |
| María López  |   17 |
| Carlos Ramos |   13 |

El Docente podrá guardar las notas como borrador y modificarlas mientras la evaluación no haya sido publicada.

## Estados de la evaluación

### Borrador

La evaluación todavía está en proceso.

El Docente puede:

* Registrar notas.
* Modificar notas.
* Completar notas pendientes.
* Revisar la información.

Las notas en este estado todavía no serán visibles para los estudiantes.

### Publicada

La evaluación ha sido confirmada por el Docente.

Las notas pasan a estar disponibles para los estudiantes.

Una vez publicada, el Docente no podrá modificar directamente las notas.

Si se requiere una modificación, el Administrador deberá habilitar nuevamente la edición.

## Flujo

**Seleccionar grupo → Crear evaluación → Registrar notas → Guardar borrador → Revisar → Publicar**

---

# 8. Estudiante

## Función principal

El Estudiante tendrá una cuenta creada por el Personal Administrativo durante su registro en la academia.

Esta cuenta le permitirá acceder al sistema y consultar su información académica y administrativa.

Este rol será principalmente de consulta y no podrá modificar información administrativa, asistencia ni notas.

## Funciones

* Iniciar sesión.
* Consultar sus datos personales.
* Consultar su matrícula.
* Consultar sus cursos.
* Consultar sus grupos.
* Consultar su horario.
* Consultar su asistencia organizada por curso.
* Consultar sus notas publicadas organizadas por curso.
* Consultar sus pagos.
* Consultar pagos pendientes.

---

# 9. Vista de cursos del estudiante

La información académica del estudiante estará organizada por cursos.

Al ingresar al sistema podrá visualizar sus cursos actuales.

Por ejemplo:

**Mis cursos**

* Matemática
* Física
* Química
* Comunicación

Cada curso funcionará como un espacio independiente de consulta.

Al ingresar a un curso, el estudiante podrá consultar la información correspondiente a ese curso.

---

# 10. Asistencia del estudiante

La asistencia no se mostrará mezclando todos los cursos.

El estudiante deberá ingresar al curso que desea consultar.

Por ejemplo:

**Mis cursos → Matemática → Asistencia**

Dentro de Matemática podrá visualizar un resumen y el detalle de sus asistencias.

## Resumen

* Clases registradas: 20.
* Presentes: 17.
* Tardanzas: 2.
* Ausencias: 1.

## Detalle

| Fecha      | Estado   |
| ---------- | -------- |
| 15/03/2027 | Presente |
| 17/03/2027 | Presente |
| 19/03/2027 | Tardanza |
| 22/03/2027 | Presente |
| 24/03/2027 | Ausente  |

Si desea consultar Física, deberá ingresar:

**Mis cursos → Física → Asistencia**

De esta manera, la información permanece organizada por curso.

El estudiante no podrá modificar los registros de asistencia.

---

# 11. Notas del estudiante

Las notas también estarán organizadas por curso.

El estudiante podrá ingresar a:

**Mis cursos → Matemática → Notas**

Y visualizar las evaluaciones publicadas correspondientes a ese curso.

Por ejemplo:

| Evaluación             | Nota |
| ---------------------- | ---: |
| Examen 01              |   15 |
| Examen 02              |   17 |
| Práctica Calificada 01 |   18 |
| Simulacro 01           |   16 |

Al final podrá visualizar el promedio correspondiente al curso:

**Promedio: 16.5**

Las evaluaciones que todavía estén en estado de borrador no serán visibles para el estudiante.

Si desea consultar otro curso, deberá ingresar al bloque correspondiente.

Por ejemplo:

**Mis cursos → Física → Notas**

---

# 12. Mi matrícula

El estudiante podrá visualizar la información de su matrícula actual:

* Código de matrícula.
* Ciclo académico.
* Curso.
* Grupo.
* Docente.
* Fecha de matrícula.
* Estado de matrícula.

Por ejemplo:

**Matrícula:** M-00025
**Ciclo:** Ciclo Verano 2027
**Curso:** Matemática
**Grupo:** Grupo A
**Docente:** Carlos López
**Estado:** Activa

---

# 13. Mis pagos

El estudiante podrá consultar los pagos asociados a su matrícula.

Ejemplo:

| Concepto      |     Monto | Estado    |
| ------------- | --------: | --------- |
| Matrícula     | S/ 150.00 | Pagado    |
| Mensualidad 1 | S/ 150.00 | Pagado    |
| Mensualidad 2 | S/ 150.00 | Pendiente |
| Mensualidad 3 | S/ 150.00 | Pendiente |

El estudiante únicamente podrá consultar esta información.

El registro, modificación o anulación de pagos corresponde al Personal Administrativo.

---

# 14. Mi horario

El estudiante podrá consultar los horarios correspondientes a sus grupos.

| Día       | Curso      | Hora        | Aula     |
| --------- | ---------- | ----------- | -------- |
| Lunes     | Matemática | 08:00–10:00 | Aula 101 |
| Miércoles | Física     | 10:00–12:00 | Aula 202 |

El estudiante podrá consultar su horario, pero no modificarlo.

---

# 15. Gestión de usuarios

## ¿Quién lo utiliza?

**Administrador del sistema.**

## Función

Permitir al Administrador crear y administrar las cuentas de acceso correspondientes al personal que utilizará el sistema.

Las cuentas de los estudiantes serán creadas por el Personal Administrativo durante el registro del estudiante.

## Tipos de cuenta gestionados por el Administrador

El Administrador podrá gestionar las cuentas de:

* Administrador.
* Personal Administrativo.
* Docente.

El Administrador no será responsable de crear las cuentas de los estudiantes.

## Creación de cuenta de estudiante

La cuenta del estudiante será creada por el **Personal Administrativo**, como parte del proceso de registro del estudiante.

Esto evita realizar dos procesos separados:

**Registrar estudiante → crear cuenta posteriormente**

En su lugar, se realizará un único proceso:

**Registrar estudiante → crear cuenta → matricular → registrar pago**

## Datos principales

Al crear una cuenta se podrán registrar:

* Nombres.
* Apellidos.
* Documento de identidad.
* Correo.
* Nombre de usuario.
* Contraseña.
* Rol.
* Estado.

Para los estudiantes, estos datos se registrarán como parte del proceso de creación de su cuenta durante el registro.

Las contraseñas deberán almacenarse utilizando un método de hash seguro.

## Estados de usuario

* Activo.
* Inactivo.

Si una persona deja de trabajar o utilizar el sistema, su cuenta se desactivará en lugar de eliminarse físicamente. De esta manera se conserva el historial de operaciones realizadas.

En el caso de los estudiantes, la cuenta también podrá permanecer registrada aunque el estudiante deje de estar matriculado temporalmente, permitiendo conservar su historial.

---

# 16. Gestión de estudiantes

## ¿Quién lo utiliza?

**Personal Administrativo.**

El Administrador podrá consultar la información, pero el registro y actualización de estudiantes corresponde principalmente al Personal Administrativo.

## Registro del estudiante

Cuando un estudiante ingrese por primera vez a la academia, el Personal Administrativo realizará el registro de sus datos y la creación de su cuenta de acceso como parte del mismo proceso.

### Flujo

**Buscar estudiante → Registrar datos → Crear cuenta → Asociar cuenta → Matricular estudiante**

Si el estudiante ya existe, el Personal Administrativo podrá utilizar su registro existente y no deberá crear una segunda cuenta.

## Datos del estudiante

* Código de estudiante.
* Nombres.
* Apellidos.
* DNI.
* Fecha de nacimiento.
* Teléfono.
* Correo.
* Dirección.
* Estado.
* Cuenta de usuario asociada.

## Estados

* Activo.
* Inactivo.

Un estudiante que tenga matrículas o pagos registrados no deberá eliminarse físicamente, con el objetivo de conservar su historial.

Su cuenta de usuario tampoco deberá eliminarse físicamente. Si corresponde, podrá ser desactivada.

---

# 17. Gestión de cursos y grupos

## ¿Quién lo utiliza?

**Administrador del sistema.**

El Administrador será responsable de crear los cursos y grupos.

## Curso

Representa la materia o asignatura.

Ejemplo:

**Matemática**

## Grupo

Representa una sección específica de un curso.

Ejemplo:

* Matemática - Grupo A.
* Matemática - Grupo B.
* Matemática - Grupo C.

Cada grupo tendrá:

* Curso.
* Docente.
* Nombre del grupo.
* Estado.

---

# 18. Gestión de ciclos académicos

## ¿Quién lo utiliza?

**Administrador del sistema.**

El Administrador podrá crear y gestionar los ciclos académicos en los que se realizarán las matrículas.

Ejemplos:

* Ciclo Verano 2027.
* Ciclo Escolar 2027.
* Ciclo Intensivo 2027.

Cada matrícula estará asociada a un ciclo académico.

---

# 19. Gestión de horarios

## ¿Quién lo utiliza?

**Administrador del sistema.**

El Administrador será responsable de asignar los horarios de los grupos.

Cada horario tendrá:

* Grupo.
* Día de la semana.
* Hora de inicio.
* Hora de fin.
* Aula.

El sistema deberá evitar, cuando corresponda, conflictos como:

* Un mismo docente asignado a dos grupos en el mismo horario.
* Un mismo aula utilizada por dos grupos al mismo tiempo.

El Docente y el Estudiante podrán consultar sus horarios, pero no modificarlos.

---

# 20. Gestión de matrículas

## ¿Quién lo utiliza?

**Personal Administrativo.**

La matrícula representa la inscripción de un estudiante en un grupo y ciclo académico.

## Datos principales

* Código de matrícula.
* Estudiante.
* Ciclo académico.
* Grupo.
* Fecha de registro.
* Estado.

## Estados

* Activa.
* Cancelada.
* Retirada.

Una matrícula confirmada no deberá eliminarse físicamente. Si cambia su situación, se actualizará su estado para conservar el historial.

## Relación con la cuenta del estudiante

La cuenta del estudiante se crea antes de completar la matrícula cuando se trata de un estudiante nuevo.

Por lo tanto, el flujo será:

**Registrar estudiante → Crear cuenta → Seleccionar ciclo → Seleccionar grupo → Registrar matrícula**

Si el estudiante ya cuenta con un registro y una cuenta, se utilizará la cuenta existente y solamente se realizará la nueva matrícula correspondiente.

---

# 21. Gestión de pagos

## ¿Quién lo utiliza?

**Personal Administrativo.**

Los pagos estarán relacionados con una matrícula.

Una matrícula podrá tener varios pagos.

## Datos principales

* Matrícula.
* Concepto.
* Monto.
* Fecha.
* Método de pago.
* Estado.

## Métodos de pago

* Efectivo.
* Transferencia.
* Tarjeta.

## Estados

* Pendiente.
* Pagado.
* Anulado.

Los pagos anulados permanecerán registrados para conservar el historial.

---

# 22. Reglas principales de acceso

| Función                                 | Administrador | Administrativo | Docente | Estudiante |
| --------------------------------------- | ------------- | -------------- | ------- | ---------- |
| Gestionar cuentas del personal          | Sí            | No             | No      | No         |
| Crear cuenta de estudiante              | No            | Sí             | No      | No         |
| Activar/desactivar cuenta de estudiante | Consulta      | Sí             | No      | No         |
| Gestionar cursos                        | Sí            | No             | No      | No         |
| Gestionar ciclos                        | Sí            | No             | No      | No         |
| Gestionar grupos                        | Sí            | No             | No      | No         |
| Gestionar horarios                      | Sí            | No             | No      | No         |
| Registrar estudiantes                   | Consulta      | Sí             | No      | No         |
| Gestionar matrículas                    | Consulta      | Sí             | No      | Consulta   |
| Gestionar pagos                         | Consulta      | Sí             | No      | Consulta   |
| Gestionar asistencia                    | Consulta      | No             | Sí      | Consulta   |
| Crear evaluaciones                      | No            | No             | Sí      | No         |
| Registrar notas                         | No            | No             | Sí      | No         |
| Publicar notas                          | No            | No             | Sí      | No         |
| Consultar notas publicadas              | Consulta      | Consulta       | Sí      | Sí         |
| Consultar asistencia                    | Consulta      | Consulta       | Sí      | Sí         |

---

# 23. Reglas principales del sistema

## Regla 1 — Roles

Cada usuario tendrá un rol y solamente podrá acceder a las funciones correspondientes a sus responsabilidades.

## Regla 2 — Cuentas de usuario

Las cuentas de usuario no se eliminarán físicamente. Se podrán activar o desactivar.

El Administrador gestionará las cuentas del personal del sistema.

El Personal Administrativo será responsable de crear las cuentas de los estudiantes durante su registro.

## Regla 3 — Registro del estudiante

Cuando un estudiante sea registrado por primera vez, el Personal Administrativo deberá crear su cuenta de acceso como parte del mismo proceso.

No se deberá crear una segunda cuenta si el estudiante ya se encuentra registrado.

## Regla 4 — Matrículas

Una matrícula confirmada no se elimina. Puede cambiar su estado a activa, cancelada o retirada, conservando el registro histórico.

## Regla 5 — Pagos

Una matrícula puede tener varios pagos. Los pagos registrados no se eliminarán directamente; si existe un error, se podrán anular conservando el registro.

## Regla 6 — Asistencia

La asistencia podrá modificarse mientras esté abierta. Una vez cerrada, quedará bloqueada.

## Regla 7 — Evaluaciones

El Docente deberá crear una evaluación antes de registrar las notas de los estudiantes.

## Regla 8 — Notas

Las notas podrán modificarse mientras la evaluación esté en estado de borrador. Una vez publicada, quedarán disponibles para el estudiante y no podrán modificarse directamente.

## Regla 9 — Acceso del estudiante

El estudiante solamente podrá consultar su propia información académica y administrativa.

## Regla 10 — Acceso del docente

El Docente solamente podrá gestionar información de los cursos y grupos que tenga asignados.

## Regla 11 — Información por curso

La asistencia y las notas del estudiante se mostrarán organizadas por curso para facilitar la consulta.

---

# 24. Flujo general del sistema

El funcionamiento general será:

**Administrador configura el sistema**

↓

**Crea ciclos, cursos y grupos**

↓

**Registra docentes**

↓

**Asigna docentes y horarios**

↓

**Personal Administrativo busca o registra al estudiante**

↓

**Si es un estudiante nuevo, registra sus datos**

↓

**Personal Administrativo crea la cuenta de acceso del estudiante**

↓

**Asocia la cuenta con el estudiante**

↓

**Selecciona el ciclo y grupo**

↓

**Registra la matrícula**

↓

**Genera el código de matrícula**

↓

**Registra el pago de matrícula, si corresponde**

↓

**Estudiante obtiene acceso al sistema**

↓

**Estudiante consulta sus cursos y horarios**

↓

**Docente visualiza sus grupos**

↓

**Docente crea las evaluaciones de sus grupos**

↓

**Docente registra y guarda las notas**

↓

**Docente publica las evaluaciones**

↓

**Estudiante consulta sus notas por curso**

↓

**Docente registra y cierra la asistencia**

↓

**Estudiante consulta su asistencia por curso**

↓

**Personal Administrativo registra las siguientes mensualidades**

↓

**Estudiante consulta el estado de sus pagos**

---

# 25. Resumen de responsabilidades

## Administrador del sistema

**Configura y controla.**

Se encarga de las cuentas del personal del sistema, cursos, ciclos, grupos, docentes y horarios.

No crea las cuentas de los estudiantes, ya que esta función corresponde al Personal Administrativo durante el registro del estudiante.

## Personal Administrativo

**Registra y gestiona las operaciones administrativas.**

Se encarga principalmente de registrar estudiantes, crear sus cuentas de acceso, realizar matrículas y gestionar pagos.

También puede consultar el resumen general de asistencia y notas de los estudiantes.

## Docente

**Gestiona la actividad académica de sus grupos.**

Se encarga de asistencia y evaluaciones. Crea las evaluaciones, registra las notas y las publica cuando están listas.

## Estudiante

**Consulta su información.**

Su cuenta es creada por el Personal Administrativo durante su registro.

Puede consultar matrícula, cursos, horarios, asistencia por curso, notas publicadas por curso y pagos.
