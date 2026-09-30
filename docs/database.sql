-- ========================================================
-- SISTEMA DE GESTIÓN ADMINISTRATIVA Y ACADÉMICA
-- BASE DE DATOS PARA ACADEMIA - SCHEMA DEFINITIVO
-- ========================================================

CREATE DATABASE IF NOT EXISTS sistema_academia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sistema_academia;

-- --------------------------------------------------------
-- 1. TABLA: Usuario
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM(
        'ADMINISTRADOR',
        'ADMINISTRATIVO',
        'DOCENTE',
        'ESTUDIANTE'
    ) NOT NULL,
    estado ENUM(
        'ACTIVO',
        'INACTIVO'
    ) DEFAULT 'ACTIVO'
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 2. TABLA: Administrador
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Administrador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    correo VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 3. TABLA: PersonalAdministrativo
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS PersonalAdministrativo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    correo VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 4. TABLA: Estudiante
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    codigo_estudiante VARCHAR(50) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion VARCHAR(255),
    estado ENUM(
        'ACTIVO',
        'INACTIVO'
    ) DEFAULT 'ACTIVO',
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 5. TABLA: Curso
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Curso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado ENUM(
        'ACTIVO',
        'INACTIVO'
    ) DEFAULT 'ACTIVO'
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 6. TABLA: CicloAcademico
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS CicloAcademico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado ENUM(
        'ACTIVO',
        'INACTIVO'
    ) DEFAULT 'ACTIVO'
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 7. TABLA: Docente
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Docente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    codigo_docente VARCHAR(50) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 8. TABLA: Grupo
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Grupo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    curso_id INT NOT NULL,
    docente_id INT NOT NULL,
    ciclo_id INT NOT NULL,
    capacidad INT NOT NULL DEFAULT 30,
    estado ENUM(
        'ACTIVO',
        'INACTIVO'
    ) DEFAULT 'ACTIVO',
    FOREIGN KEY (curso_id) REFERENCES Curso(id),
    FOREIGN KEY (docente_id) REFERENCES Docente(id),
    FOREIGN KEY (ciclo_id) REFERENCES CicloAcademico(id)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 9. TABLA: Horario
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Horario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    dia_semana ENUM(
        'LUNES',
        'MARTES',
        'MIERCOLES',
        'JUEVES',
        'VIERNES',
        'SABADO',
        'DOMINGO'
    ) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    aula VARCHAR(50) NOT NULL,
    FOREIGN KEY (grupo_id) REFERENCES Grupo(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 10. TABLA: Matricula
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Matricula (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_matricula VARCHAR(50) NOT NULL UNIQUE,
    estudiante_id INT NOT NULL,
    grupo_id INT NOT NULL,
    ciclo_id INT NOT NULL,
    estado ENUM(
        'ACTIVA',
        'CANCELADA',
        'RETIRADA'
    ) DEFAULT 'ACTIVA',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES Estudiante(id),
    FOREIGN KEY (grupo_id) REFERENCES Grupo(id),
    FOREIGN KEY (ciclo_id) REFERENCES CicloAcademico(id),
    UNIQUE (estudiante_id, grupo_id, ciclo_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 11. TABLA: Pago
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS Pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricula_id INT NOT NULL,
    concepto VARCHAR(150) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    metodo_pago ENUM(
        'EFECTIVO',
        'TRANSFERENCIA',
        'TARJETA'
    ) NOT NULL,
    estado ENUM(
        'PENDIENTE',
        'PAGADO',
        'ANULADO'
    ) DEFAULT 'PENDIENTE',
    FOREIGN KEY (matricula_id) REFERENCES Matricula(id)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 12. TABLA: SesionAsistencia
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS SesionAsistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    fecha DATE NOT NULL,
    estado ENUM(
        'ABIERTA',
        'CERRADA'
    ) DEFAULT 'ABIERTA',
    FOREIGN KEY (grupo_id) REFERENCES Grupo(id),
    UNIQUE (grupo_id, fecha)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 13. TABLA: DetalleAsistencia
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS DetalleAsistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_asistencia_id INT NOT NULL,
    estudiante_id INT NOT NULL,
    estado_asistencia ENUM(
        'PRESENTE',
        'AUSENTE',
        'TARDANZA'
    ) NOT NULL,
    FOREIGN KEY (sesion_asistencia_id) REFERENCES SesionAsistencia(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_id) REFERENCES Estudiante(id),
    UNIQUE (sesion_asistencia_id, estudiante_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 14. TABLA: EvaluacionNotas
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS EvaluacionNotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    nombre_evaluacion VARCHAR(150) NOT NULL,
    fecha DATE NOT NULL,
    estado ENUM(
        'BORRADOR',
        'PUBLICADA'
    ) DEFAULT 'BORRADOR',
    FOREIGN KEY (grupo_id) REFERENCES Grupo(id)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 15. TABLA: DetalleNota
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS DetalleNota (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluacion_id INT NOT NULL,
    estudiante_id INT NOT NULL,
    valor_nota DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (evaluacion_id) REFERENCES EvaluacionNotas(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_id) REFERENCES Estudiante(id),
    UNIQUE (evaluacion_id, estudiante_id)
) ENGINE=InnoDB;

-- ========================================================
-- DATOS INICIALES DE DEMOSTRACIÓN
-- Credenciales en CREDENCIALES_DEMO.txt
-- INSERT IGNORE permite volver a ejecutar este bloque sin duplicar IDs.
-- ========================================================
INSERT IGNORE INTO Usuario (id, nombre_usuario, password_hash, rol, estado) VALUES
(1, 'admin', '$2a$10$5ERV8Z9RSiMA1P77gpbM..nwMfCjuS9UMPzMA4MVLuN7MRVGXmbce', 'ADMINISTRADOR', 'ACTIVO'),
(2, 'secretaria', '$2a$10$nEO948vCeaJshe/BrYAaj.Jo6yJdVWjbIXXNRHjt3ce24GdSb2dVy', 'ADMINISTRATIVO', 'ACTIVO'),
(3, 'docente', '$2a$10$d0MGr917RIFCK85yACaPbeziNpjvd.itLPxzdEI140gwKeCF.Pjwe', 'DOCENTE', 'ACTIVO'),
(4, 'estudiante', '$2a$10$Y/flIjwbTC6A8IaHwL6pdOUS/zI7zkNQmjf2I./MD59UzUqnZcwr6', 'ESTUDIANTE', 'ACTIVO');

INSERT IGNORE INTO Administrador (id, usuario_id, nombres, apellidos, dni, correo) VALUES
(1, 1, 'Alejandro', 'Torres', '70000001', 'admin@althea.edu');
INSERT IGNORE INTO PersonalAdministrativo (id, usuario_id, nombres, apellidos, dni, correo) VALUES
(1, 2, 'Lucía', 'Mendoza', '70000002', 'lucia@althea.edu');
INSERT IGNORE INTO Docente (id, usuario_id, codigo_docente, nombres, apellidos, dni, telefono, correo) VALUES
(1, 3, 'DOC-0001', 'Carlos', 'Ramírez', '70000003', '999111222', 'carlos.ramirez@althea.edu');
INSERT IGNORE INTO Usuario (id, nombre_usuario, password_hash, rol, estado) VALUES
(5, 'diego', '$2a$10$Y/flIjwbTC6A8IaHwL6pdOUS/zI7zkNQmjf2I./MD59UzUqnZcwr6', 'ESTUDIANTE', 'ACTIVO'),
(6, 'valeria', '$2a$10$Y/flIjwbTC6A8IaHwL6pdOUS/zI7zkNQmjf2I./MD59UzUqnZcwr6', 'ESTUDIANTE', 'ACTIVO');
INSERT IGNORE INTO Estudiante (id, usuario_id, codigo_estudiante, nombres, apellidos, dni, fecha_nacimiento, telefono, correo, direccion, estado) VALUES
(1, 4, 'EST-0001', 'Mariana', 'Salazar', '70000004', '2005-06-14', '999111333', 'mariana.salazar@correo.pe', 'Lima', 'ACTIVO'),
(2, 5, 'EST-0002', 'Diego', 'Quispe', '70000005', '2004-02-21', '999111334', 'diego.quispe@correo.pe', 'Lima', 'ACTIVO'),
(3, 6, 'EST-0003', 'Valeria', 'Mendoza', '70000006', '2005-11-03', '999111335', 'valeria.mendoza@correo.pe', 'Lima', 'ACTIVO');

INSERT IGNORE INTO Curso (id, nombre, descripcion, estado) VALUES
(1, 'Matemática', 'Fundamentos y razonamiento matemático', 'ACTIVO'),
(2, 'Física', 'Conceptos y resolución de problemas de física', 'ACTIVO'),
(3, 'Comunicación', 'Comprensión lectora y expresión escrita', 'ACTIVO');
INSERT IGNORE INTO CicloAcademico (id, nombre, fecha_inicio, fecha_fin, estado) VALUES
(1, 'Ciclo II 2026', '2026-09-01', '2027-01-31', 'ACTIVO');
INSERT IGNORE INTO Grupo (id, nombre, curso_id, docente_id, ciclo_id, capacidad, estado) VALUES
(1, 'MAT-A', 1, 1, 1, 30, 'ACTIVO'),
(2, 'FIS-A', 2, 1, 1, 25, 'ACTIVO'),
(3, 'COM-A', 3, 1, 1, 25, 'ACTIVO');
INSERT IGNORE INTO Horario (id, grupo_id, dia_semana, hora_inicio, hora_fin, aula) VALUES
(1, 1, 'LUNES', '08:00:00', '10:00:00', 'Aula 101'),
(2, 2, 'MIERCOLES', '10:00:00', '12:00:00', 'Aula 202'),
(3, 3, 'VIERNES', '14:00:00', '16:00:00', 'Aula 104');
INSERT IGNORE INTO Matricula (id, codigo_matricula, estudiante_id, grupo_id, ciclo_id, estado, fecha_registro) VALUES
(1, 'MAT-2026-0001', 1, 1, 1, 'ACTIVA', '2026-09-01 09:00:00'),
(2, 'MAT-2026-0002', 1, 2, 1, 'ACTIVA', '2026-09-01 09:10:00'),
(3, 'MAT-2026-0003', 2, 1, 1, 'ACTIVA', '2026-09-02 10:00:00'),
(4, 'MAT-2026-0004', 3, 3, 1, 'ACTIVA', '2026-09-03 11:00:00');
INSERT IGNORE INTO Pago (id, matricula_id, concepto, monto, fecha, metodo_pago, estado) VALUES
(1, 1, 'Matrícula', 150.00, '2026-09-01 09:05:00', 'EFECTIVO', 'PAGADO'),
(2, 1, 'Mensualidad septiembre', 180.00, '2026-09-05 12:00:00', 'TRANSFERENCIA', 'PAGADO'),
(3, 2, 'Mensualidad septiembre', 180.00, '2026-09-10 00:00:00', 'EFECTIVO', 'PENDIENTE'),
(4, 3, 'Matrícula', 150.00, '2026-09-02 10:05:00', 'TARJETA', 'PAGADO');
INSERT IGNORE INTO SesionAsistencia (id, grupo_id, fecha, estado) VALUES
(1, 1, '2026-09-07', 'CERRADA'), (2, 1, '2026-09-14', 'CERRADA'),
(3, 2, '2026-09-09', 'CERRADA');
INSERT IGNORE INTO DetalleAsistencia (id, sesion_asistencia_id, estudiante_id, estado_asistencia) VALUES
(1, 1, 1, 'PRESENTE'), (2, 1, 2, 'TARDANZA'), (3, 2, 1, 'PRESENTE'), (4, 3, 1, 'AUSENTE');
INSERT IGNORE INTO EvaluacionNotas (id, grupo_id, nombre_evaluacion, fecha, estado) VALUES
(1, 1, 'Práctica calificada 1', '2026-09-20', 'PUBLICADA'),
(2, 1, 'Examen parcial', '2026-10-15', 'BORRADOR');
INSERT IGNORE INTO DetalleNota (id, evaluacion_id, estudiante_id, valor_nota) VALUES
(1, 1, 1, 17.50), (2, 1, 2, 15.00);
