import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del Pool de Conexiones a MySQL
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_academia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Función para comprobar la conexión inicial a la Base de Datos
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ [DATABASE] Conexión exitosa a MySQL (Base de datos:', process.env.DB_NAME || 'sistema_academia', ')');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ [DATABASE] Error al conectar a la Base de Datos MySQL:');
    if (error instanceof Error) {
      console.error(`   Mensaje: ${error.message}`);
    } else {
      console.error(error);
    }
    return false;
  }
};

export default pool;
