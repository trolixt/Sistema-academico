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

UPDATE Matricula m INNER JOIN Estudiante e ON e.id = m.estudiante_id
SET m.canal_id = e.canal_id
WHERE m.canal_id IS NULL AND e.canal_id IS NOT NULL;

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
