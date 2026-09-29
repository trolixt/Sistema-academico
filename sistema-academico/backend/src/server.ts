import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { testConnection } from './config/database';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    // 1. Verificar conexión a la Base de Datos MySQL
    console.log('🔄 [BOOTSTRAP] Comprobando conexión a la Base de Datos...');
    await testConnection();

    // 2. Iniciar el servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 [SERVER] Servidor backend escuchando en: http://localhost:${PORT}`);
      console.log(`📡 [HEALTH] Comprobación de estado: http://localhost:${PORT}/api/health`);
      console.log(`🔐 [AUTH] Endpoint de login: http://localhost:${PORT}/api/auth/login`);
    });
  } catch (error) {
    console.error('❌ [FATAL] Error crítico al inicializar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();
