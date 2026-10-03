import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env') });

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Falta configurar ${name} en backend/.env`);
  }
  return value;
};

const databasePort = Number(requiredEnv('DB_PORT'));
if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535) {
  throw new Error('DB_PORT debe ser un puerto válido en backend/.env');
}

const databaseName = requiredEnv('DB_NAME');
if (process.env.DB_PASSWORD === undefined) {
  throw new Error('Falta configurar DB_PASSWORD en backend/.env');
}

export const pool = mysql.createPool({
  host: requiredEnv('DB_HOST'),
  port: databasePort,
  user: requiredEnv('DB_USER'),
  password: process.env.DB_PASSWORD,
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ [DATABASE] Conexión exitosa a MySQL (Base de datos: ${databaseName})`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ [DATABASE] Error al conectar a la Base de Datos MySQL:', error);
    return false;
  }
};

export default pool;
