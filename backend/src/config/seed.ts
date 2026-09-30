import bcrypt from 'bcryptjs';
import pool, { testConnection } from './database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

async function runSeed() {
  console.log('🌱 [SEED] Iniciando población inicial de la base de datos...');

  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ [SEED] No se pudo conectar a la base de datos. Asegúrate de que MySQL esté activo.');
    process.exit(1);
  }

  try {
    const defaultPassword = 'Admin2026*';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // 1. Verificar si ya existe el usuario administrador inicial
    const [existingAdmin] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM Usuario WHERE nombre_usuario = ? LIMIT 1',
      ['admin']
    );

    if (existingAdmin.length === 0) {
      // Crear Usuario Admin
      const [userResult] = await pool.execute<ResultSetHeader>(
        'INSERT INTO Usuario (nombre_usuario, password_hash, rol, estado) VALUES (?, ?, ?, ?)',
        ['admin', passwordHash, 'ADMINISTRADOR', 'ACTIVO']
      );

      const usuarioId = userResult.insertId;

      // Crear Perfil de Administrador
      await pool.execute(
        'INSERT INTO Administrador (usuario_id, nombres, apellidos, dni, correo) VALUES (?, ?, ?, ?, ?)',
        [usuarioId, 'Administrador', 'Principal', '00000000', 'admin@academia.com']
      );

      console.log('✅ [SEED] Usuario administrador creado con éxito:');
      console.log('   - Usuario: admin');
      console.log('   - Contraseña:', defaultPassword);
      console.log('   - Rol: ADMINISTRADOR');
    } else {
      console.log('ℹ️ [SEED] El usuario "admin" ya existe en la base de datos.');
    }

    console.log('✨ [SEED] Proceso finalizado.');
    process.exit(0);
  } catch (error) {
    console.error('❌ [SEED] Error ejecutando el seed:', error);
    process.exit(1);
  }
}

runSeed();
