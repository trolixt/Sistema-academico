import { randomInt } from 'crypto';
import { RolUsuario } from '../types';

const prefijoPorRol: Record<RolUsuario, string> = {
  ESTUDIANTE: '00',
  DOCENTE: '10',
  ADMINISTRATIVO: '20',
  ADMINISTRADOR: '90'
};

export const generarIdAcceso = (rol: RolUsuario): string =>
  `${prefijoPorRol[rol]}${String(randomInt(0, 10_000_000)).padStart(7, '0')}`;
