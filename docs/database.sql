
CREATE DATABASE IF NOT EXISTS sistemaacademia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sistemaacademia;

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

CREATE TABLE IF NOT EXISTS Administrador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    correo VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PersonalAdministrativo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    correo VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    canal_id TINYINT UNSIGNED NULL,
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

CREATE TABLE IF NOT EXISTS Curso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado ENUM(
        'ACTIVO',
        'INACTIVO'
    ) DEFAULT 'ACTIVO'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Canal (
    id TINYINT UNSIGNED PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT 'azul',
    orden TINYINT UNSIGNED NOT NULL UNIQUE,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT chk_canal_id CHECK (id BETWEEN 1 AND 4)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS CanalCurso (
    canal_id TINYINT UNSIGNED NOT NULL,
    curso_id INT NOT NULL,
    orden SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (canal_id, curso_id),
    UNIQUE KEY uq_canal_curso_orden (canal_id, orden),
    FOREIGN KEY (canal_id) REFERENCES Canal(id),
    FOREIGN KEY (curso_id) REFERENCES Curso(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET @tiene_canal_estudiante = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Estudiante' AND COLUMN_NAME = 'canal_id'
);
SET @ddl_canal_estudiante = IF(@tiene_canal_estudiante = 0,
    'ALTER TABLE Estudiante ADD COLUMN canal_id TINYINT UNSIGNED NULL AFTER usuario_id', 'SELECT 1');
PREPARE stmt_canal_estudiante FROM @ddl_canal_estudiante;
EXECUTE stmt_canal_estudiante;
DEALLOCATE PREPARE stmt_canal_estudiante;

SET @tiene_fk_canal_estudiante = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Estudiante' AND COLUMN_NAME = 'canal_id' AND REFERENCED_TABLE_NAME = 'Canal'
);
SET @ddl_fk_canal_estudiante = IF(@tiene_fk_canal_estudiante = 0,
    'ALTER TABLE Estudiante ADD CONSTRAINT fk_estudiante_canal FOREIGN KEY (canal_id) REFERENCES Canal(id)', 'SELECT 1');
PREPARE stmt_fk_canal_estudiante FROM @ddl_fk_canal_estudiante;
EXECUTE stmt_fk_canal_estudiante;
DEALLOCATE PREPARE stmt_fk_canal_estudiante;

INSERT IGNORE INTO Canal (id, nombre, descripcion, color, orden) VALUES
(1, 'Ciencias de la Salud y Biomédicas', 'Preparación para carreras de salud y ciencias biomédicas.', 'verde', 1),
(2, 'Ciencias Exactas e Ingenierías', 'Preparación para carreras de ciencias exactas e ingeniería.', 'azul', 2),
(3, 'Ciencias Sociales, Letras y Humanidades', 'Preparación para carreras de ciencias sociales y humanidades.', 'violeta', 3),
(4, 'Ciencias Empresariales y Actuariales', 'Preparación para carreras empresariales y actuariales.', 'ambar', 4);

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

CREATE TABLE IF NOT EXISTS Grupo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    curso_id INT NOT NULL,
    canal_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
    docente_id INT NOT NULL,
    ciclo_id INT NOT NULL,
    capacidad INT NOT NULL DEFAULT 30,
    estado ENUM(
        'ACTIVO',
        'INACTIVO'
    ) DEFAULT 'ACTIVO',
    FOREIGN KEY (curso_id) REFERENCES Curso(id),
    FOREIGN KEY (canal_id) REFERENCES Canal(id),
    FOREIGN KEY (docente_id) REFERENCES Docente(id),
    FOREIGN KEY (ciclo_id) REFERENCES CicloAcademico(id)
) ENGINE=InnoDB;

SET @tiene_canal_grupo = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Grupo' AND COLUMN_NAME = 'canal_id'
);
SET @ddl_canal_grupo = IF(@tiene_canal_grupo = 0,
    'ALTER TABLE Grupo ADD COLUMN canal_id TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER curso_id', 'SELECT 1');
PREPARE stmt_canal_grupo FROM @ddl_canal_grupo;
EXECUTE stmt_canal_grupo;
DEALLOCATE PREPARE stmt_canal_grupo;

SET @ddl_migrar_canal_grupo = IF(@tiene_canal_grupo = 0,
    'UPDATE Grupo SET canal_id = CASE curso_id WHEN 1 THEN 2 WHEN 2 THEN 2 WHEN 3 THEN 3 ELSE 1 END', 'SELECT 1');
PREPARE stmt_migrar_canal_grupo FROM @ddl_migrar_canal_grupo;
EXECUTE stmt_migrar_canal_grupo;
DEALLOCATE PREPARE stmt_migrar_canal_grupo;

SET @tiene_fk_canal_grupo = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Grupo' AND COLUMN_NAME = 'canal_id' AND REFERENCED_TABLE_NAME = 'Canal'
);
SET @ddl_fk_canal_grupo = IF(@tiene_fk_canal_grupo = 0,
    'ALTER TABLE Grupo ADD CONSTRAINT fk_grupo_canal FOREIGN KEY (canal_id) REFERENCES Canal(id)', 'SELECT 1');
PREPARE stmt_fk_canal_grupo FROM @ddl_fk_canal_grupo;
EXECUTE stmt_fk_canal_grupo;
DEALLOCATE PREPARE stmt_fk_canal_grupo;
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

CREATE TABLE IF NOT EXISTS Matricula (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_matricula VARCHAR(50) NOT NULL UNIQUE,
    estudiante_id INT NOT NULL,
    canal_id TINYINT UNSIGNED NOT NULL,
    grupo_id INT NULL,
    ciclo_id INT NOT NULL,
    estado ENUM(
        'PENDIENTE_PAGO',
        'ACTIVA',
        'CANCELADA',
        'RETIRADA'
    ) DEFAULT 'PENDIENTE_PAGO',
    monto_mensualidad DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES Estudiante(id),
    FOREIGN KEY (canal_id) REFERENCES Canal(id),
    FOREIGN KEY (grupo_id) REFERENCES Grupo(id) ON DELETE SET NULL,
    FOREIGN KEY (ciclo_id) REFERENCES CicloAcademico(id),
    UNIQUE (estudiante_id, grupo_id, ciclo_id)
) ENGINE=InnoDB;

SET @tiene_canal_matricula = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Matricula' AND COLUMN_NAME = 'canal_id'
);
SET @ddl_canal_matricula = IF(@tiene_canal_matricula = 0,
    'ALTER TABLE Matricula ADD COLUMN canal_id TINYINT UNSIGNED NULL AFTER estudiante_id', 'SELECT 1');
PREPARE stmt_canal_matricula FROM @ddl_canal_matricula;
EXECUTE stmt_canal_matricula;
DEALLOCATE PREPARE stmt_canal_matricula;

UPDATE Matricula m INNER JOIN Grupo g ON g.id = m.grupo_id
SET m.canal_id = g.canal_id
WHERE m.canal_id IS NULL;

ALTER TABLE Matricula MODIFY COLUMN canal_id TINYINT UNSIGNED NOT NULL;
ALTER TABLE Matricula MODIFY COLUMN grupo_id INT NULL;

SET @tiene_fk_canal_matricula = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Matricula' AND COLUMN_NAME = 'canal_id' AND REFERENCED_TABLE_NAME = 'Canal'
);
SET @ddl_fk_canal_matricula = IF(@tiene_fk_canal_matricula = 0,
    'ALTER TABLE Matricula ADD CONSTRAINT fk_matricula_canal FOREIGN KEY (canal_id) REFERENCES Canal(id)', 'SELECT 1');
PREPARE stmt_fk_canal_matricula FROM @ddl_fk_canal_matricula;
EXECUTE stmt_fk_canal_matricula;
DEALLOCATE PREPARE stmt_fk_canal_matricula;

UPDATE Estudiante e
INNER JOIN (
    SELECT m.estudiante_id, MIN(g.canal_id) AS canal_id
    FROM Matricula m
    INNER JOIN Grupo g ON g.id = m.grupo_id
    WHERE m.estado IN ('ACTIVA', 'PENDIENTE_PAGO')
    GROUP BY m.estudiante_id
) asignacion ON asignacion.estudiante_id = e.id
SET e.canal_id = asignacion.canal_id
WHERE e.canal_id IS NULL;

CREATE TABLE IF NOT EXISTS Pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_pago VARCHAR(20) NULL UNIQUE,
    matricula_id INT NOT NULL,
    concepto VARCHAR(150) NOT NULL,
    tipo_pago ENUM('MATRICULA', 'MENSUALIDAD', 'OTRO') NOT NULL DEFAULT 'OTRO',
    periodo CHAR(7) NULL,
    fecha_vencimiento DATE NULL,
    monto DECIMAL(10,2) NOT NULL,
    monto_recibido DECIMAL(10,2) NULL,
    fecha DATETIME NULL DEFAULT NULL,
    metodo_pago ENUM(
        'EFECTIVO',
        'YAPE',
        'TRANSFERENCIA'
    ) NULL,
    referencia_operacion VARCHAR(100) NULL,
    estado ENUM(
        'PENDIENTE',
        'PAGADO',
        'ANULADO'
    ) DEFAULT 'PENDIENTE',
    FOREIGN KEY (matricula_id) REFERENCES Matricula(id),
    UNIQUE KEY uq_pago_periodo_matricula (matricula_id, tipo_pago, periodo)
) ENGINE=InnoDB;

SET @tiene_codigo_pago = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Pago' AND COLUMN_NAME = 'codigo_pago'
);
SET @ddl_codigo_pago = IF(@tiene_codigo_pago = 0,
    'ALTER TABLE Pago ADD COLUMN codigo_pago VARCHAR(20) NULL UNIQUE AFTER id', 'SELECT 1');
PREPARE stmt_codigo_pago FROM @ddl_codigo_pago;
EXECUTE stmt_codigo_pago;
DEALLOCATE PREPARE stmt_codigo_pago;

SET @tiene_monto_recibido = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Pago' AND COLUMN_NAME = 'monto_recibido'
);
SET @ddl_monto_recibido = IF(@tiene_monto_recibido = 0,
    'ALTER TABLE Pago ADD COLUMN monto_recibido DECIMAL(10,2) NULL AFTER monto', 'SELECT 1');
PREPARE stmt_monto_recibido FROM @ddl_monto_recibido;
EXECUTE stmt_monto_recibido;
DEALLOCATE PREPARE stmt_monto_recibido;

SET @tipo_metodo_pago = (
    SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Pago' AND COLUMN_NAME = 'metodo_pago'
);
SET @ddl_metodo_pago = IF(@tipo_metodo_pago NOT LIKE '%YAPE%',
    'ALTER TABLE Pago MODIFY metodo_pago ENUM(''EFECTIVO'',''YAPE'',''TRANSFERENCIA'',''TARJETA'') NULL', 'SELECT 1');
PREPARE stmt_metodo_pago FROM @ddl_metodo_pago;
EXECUTE stmt_metodo_pago;
DEALLOCATE PREPARE stmt_metodo_pago;

UPDATE Pago
SET codigo_pago = CONCAT('SA-', LPAD(id, 10, '0'))
WHERE codigo_pago IS NULL;

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

CREATE TABLE IF NOT EXISTS DetalleAsistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_asistencia_id INT NOT NULL,
    estudiante_id INT NOT NULL,
    estado_asistencia ENUM(
        'PRESENTE',
        'AUSENTE',
        'TARDANZA',
        'JUSTIFICADO'
    ) NOT NULL,
    FOREIGN KEY (sesion_asistencia_id) REFERENCES SesionAsistencia(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_id) REFERENCES Estudiante(id),
    UNIQUE (sesion_asistencia_id, estudiante_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Simulacro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    canal_id TINYINT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    fecha DATE NOT NULL,
    puntaje_maximo SMALLINT UNSIGNED NOT NULL DEFAULT 600,
    estado ENUM('PROGRAMADO', 'REALIZADO', 'CANCELADO') NOT NULL DEFAULT 'PROGRAMADO',
    FOREIGN KEY (canal_id) REFERENCES Canal(id),
    CONSTRAINT chk_simulacro_puntaje_maximo CHECK (puntaje_maximo BETWEEN 1 AND 600)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ResultadoSimulacro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulacro_id INT NOT NULL,
    estudiante_id INT NOT NULL,
    puntaje DECIMAL(6,2) NOT NULL,
    observacion VARCHAR(500) NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulacro_id) REFERENCES Simulacro(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_id) REFERENCES Estudiante(id),
    UNIQUE KEY uq_resultado_simulacro_estudiante (simulacro_id, estudiante_id),
    CONSTRAINT chk_resultado_simulacro_puntaje CHECK (puntaje BETWEEN 0 AND 600)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS DetalleNota;
DROP TABLE IF EXISTS EvaluacionNotas;

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
(1, 'Razonamiento Matemático', 'Área de razonamiento matemático.', 'ACTIVO'),
(2, 'Física', 'Conceptos y resolución de problemas de física', 'ACTIVO'),
(3, 'Lenguaje y Literatura', 'Área de lenguaje y literatura.', 'ACTIVO');
UPDATE Curso SET nombre = 'Razonamiento Matemático', descripcion = 'Área de razonamiento matemático.' WHERE id = 1 AND nombre = 'Matemática';
UPDATE Curso SET nombre = 'Lenguaje y Literatura', descripcion = 'Área de lenguaje y literatura.' WHERE id = 3 AND nombre = 'Comunicación';
INSERT IGNORE INTO Canal (id, nombre, descripcion, color, orden) VALUES
(1, 'Ciencias de la Salud y Biomédicas', 'Preparación para carreras de salud y ciencias biomédicas.', 'verde', 1),
(2, 'Ciencias Exactas e Ingenierías', 'Preparación para carreras de ciencias exactas e ingeniería.', 'azul', 2),
(3, 'Ciencias Sociales, Letras y Humanidades', 'Preparación para carreras de ciencias sociales y humanidades.', 'violeta', 3),
(4, 'Ciencias Empresariales y Actuariales', 'Preparación para carreras empresariales y actuariales.', 'ambar', 4);
INSERT INTO Curso (nombre, descripcion, estado)
SELECT catalogo.nombre, catalogo.descripcion, 'ACTIVO'
FROM (
    SELECT 'Biología' nombre, 'Área de ciencias biológicas para el canal de salud.' descripcion UNION ALL
    SELECT 'Anatomía', 'Área de anatomía para el canal de salud.' UNION ALL SELECT 'Química', 'Área de química.' UNION ALL
    SELECT 'Razonamiento Matemático', 'Área de razonamiento matemático.' UNION ALL SELECT 'Razonamiento Verbal', 'Área de razonamiento verbal.' UNION ALL
    SELECT 'Lenguaje', 'Área de lenguaje.' UNION ALL SELECT 'Álgebra', 'Área de álgebra.' UNION ALL SELECT 'Geometría', 'Área de geometría.' UNION ALL
    SELECT 'Trigonometría', 'Área de trigonometría.' UNION ALL SELECT 'Aritmética', 'Área de aritmética.' UNION ALL
    SELECT 'Lenguaje y Literatura', 'Área de lenguaje y literatura.' UNION ALL SELECT 'Historia (del Perú y Universal)', 'Área de historia del Perú y universal.' UNION ALL
    SELECT 'Geografía', 'Área de geografía.' UNION ALL SELECT 'Economía', 'Área de economía.' UNION ALL
    SELECT 'Educación Cívica', 'Área de educación cívica.' UNION ALL SELECT 'Filosofía y Psicología', 'Área de filosofía y psicología.' UNION ALL
    SELECT 'Historia y Geografía', 'Área de historia y geografía.'
) catalogo
WHERE NOT EXISTS (SELECT 1 FROM Curso existente WHERE existente.nombre = catalogo.nombre);
INSERT IGNORE INTO CanalCurso (canal_id, curso_id, orden)
SELECT mapa.canal_id, c.id, mapa.orden
FROM (
    SELECT 1 canal_id, 'Biología' nombre, 1 orden UNION ALL SELECT 1, 'Anatomía', 2 UNION ALL SELECT 1, 'Química', 3 UNION ALL SELECT 1, 'Razonamiento Matemático', 4 UNION ALL SELECT 1, 'Razonamiento Verbal', 5 UNION ALL SELECT 1, 'Física', 6 UNION ALL SELECT 1, 'Lenguaje', 7 UNION ALL
    SELECT 2, 'Álgebra', 1 UNION ALL SELECT 2, 'Geometría', 2 UNION ALL SELECT 2, 'Trigonometría', 3 UNION ALL SELECT 2, 'Aritmética', 4 UNION ALL SELECT 2, 'Física', 5 UNION ALL SELECT 2, 'Química', 6 UNION ALL SELECT 2, 'Razonamiento Matemático', 7 UNION ALL SELECT 2, 'Razonamiento Verbal', 8 UNION ALL
    SELECT 3, 'Lenguaje y Literatura', 1 UNION ALL SELECT 3, 'Historia (del Perú y Universal)', 2 UNION ALL SELECT 3, 'Geografía', 3 UNION ALL SELECT 3, 'Economía', 4 UNION ALL SELECT 3, 'Educación Cívica', 5 UNION ALL SELECT 3, 'Filosofía y Psicología', 6 UNION ALL SELECT 3, 'Razonamiento Verbal', 7 UNION ALL SELECT 3, 'Razonamiento Matemático', 8 UNION ALL
    SELECT 4, 'Economía', 1 UNION ALL SELECT 4, 'Aritmética', 2 UNION ALL SELECT 4, 'Álgebra', 3 UNION ALL SELECT 4, 'Razonamiento Matemático', 4 UNION ALL SELECT 4, 'Razonamiento Verbal', 5 UNION ALL SELECT 4, 'Lenguaje', 6 UNION ALL SELECT 4, 'Historia y Geografía', 7
) mapa
    INNER JOIN Curso c ON c.nombre = mapa.nombre
GROUP BY mapa.canal_id, c.id, mapa.orden;
INSERT IGNORE INTO CicloAcademico (id, nombre, fecha_inicio, fecha_fin, estado) VALUES
(1, 'Ciclo II 2026', '2026-09-01', '2027-01-31', 'ACTIVO');
INSERT IGNORE INTO Grupo (id, nombre, curso_id, canal_id, docente_id, ciclo_id, capacidad, estado) VALUES
(1, 'RM-A', 1, 2, 1, 1, 30, 'ACTIVO'),
(2, 'FIS-A', 2, 2, 1, 1, 25, 'ACTIVO'),
(3, 'LL-A', 3, 3, 1, 1, 25, 'ACTIVO');
INSERT IGNORE INTO Horario (id, grupo_id, dia_semana, hora_inicio, hora_fin, aula) VALUES
(1, 1, 'LUNES', '08:00:00', '10:00:00', 'Aula 101'),
(2, 2, 'MIERCOLES', '10:00:00', '12:00:00', 'Aula 202'),
(3, 3, 'VIERNES', '14:00:00', '16:00:00', 'Aula 104');
INSERT IGNORE INTO Matricula (id, codigo_matricula, estudiante_id, canal_id, grupo_id, ciclo_id, estado, fecha_registro) VALUES
(1, 'MAT-2026-0001', 1, 2, 1, 1, 'ACTIVA', '2026-09-01 09:00:00'),
(2, 'MAT-2026-0002', 1, 2, 2, 1, 'ACTIVA', '2026-09-01 09:10:00'),
(3, 'MAT-2026-0003', 2, 2, 1, 1, 'ACTIVA', '2026-09-02 10:00:00'),
(4, 'MAT-2026-0004', 3, 3, 3, 1, 'ACTIVA', '2026-09-03 11:00:00');
INSERT IGNORE INTO Pago (id, codigo_pago, matricula_id, concepto, tipo_pago, periodo, monto, monto_recibido, fecha, metodo_pago, referencia_operacion, estado) VALUES
(1, 'SA-0000000001', 1, 'Matrícula', 'MATRICULA', NULL, 150.00, 150.00, '2026-09-01 09:05:00', 'EFECTIVO', NULL, 'PAGADO'),
(2, 'SA-0000000002', 1, 'Mensualidad septiembre', 'MENSUALIDAD', '2026-09', 180.00, 180.00, '2026-09-05 12:00:00', 'TRANSFERENCIA', 'DEMO-TRANSFERENCIA-0002', 'PAGADO'),
(3, 'SA-0000000003', 2, 'Mensualidad septiembre', 'MENSUALIDAD', '2026-09', 180.00, NULL, NULL, NULL, NULL, 'PENDIENTE'),
(4, 'SA-0000000004', 3, 'Matrícula', 'MATRICULA', NULL, 150.00, 150.00, '2026-09-02 10:05:00', 'YAPE', 'DEMO-YAPE-0004', 'PAGADO');
INSERT IGNORE INTO SesionAsistencia (id, grupo_id, fecha, estado) VALUES
(1, 1, '2026-09-07', 'CERRADA'), (2, 1, '2026-09-14', 'CERRADA'),
(3, 2, '2026-09-09', 'CERRADA');
INSERT IGNORE INTO DetalleAsistencia (id, sesion_asistencia_id, estudiante_id, estado_asistencia) VALUES
(1, 1, 1, 'PRESENTE'), (2, 1, 2, 'TARDANZA'), (3, 2, 1, 'PRESENTE'), (4, 3, 1, 'AUSENTE');
