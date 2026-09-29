import express, { Application, Request, Response } from 'express';
import cors from 'cors';

// Rutas de Módulos
import authRoutes from './routes/auth.routes';
import usuarioRoutes from './routes/usuario.routes';
import estudianteRoutes from './routes/estudiante.routes';
import docenteRoutes from './routes/docente.routes';
import academicoRoutes from './routes/academico.routes';
import matriculaRoutes from './routes/matricula.routes';
import pagoRoutes from './routes/pago.routes';
import evaluacionRoutes from './routes/evaluacion.routes';

// Middlewares
import { notFoundHandler } from './middlewares/not-found.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// Middlewares Globales
app.use(cors({
  origin: '*', // Configurable para aceptar solicitudes desde el frontend en Next.js
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de estado / salud de la API
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API del Sistema de Gestión Administrativa y Académica funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Registro de Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/estudiantes', estudianteRoutes);
app.use('/api/docentes', docenteRoutes);
app.use('/api/academicos', academicoRoutes);
app.use('/api/matriculas', matriculaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);

// Manejadores de Errores
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
