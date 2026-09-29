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
-- DATOS INICIALES (SEED DE PRUEBA)
-- Contraseñas hasheadas con bcrypt (10 rounds):
-- Para 'admin': 'Admin123*' -> $2b$10$EpI3iVzVv0N5X5L6F2s42.J8sC5VvQp0kL1qX6OaP5aB9T5b8k7Wy (ejemplo)
-- Se creará un usuario administrador inicial
-- ========================================================
