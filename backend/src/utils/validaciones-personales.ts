export function validarDni(dni: string | undefined): void {
  if (dni !== undefined && !/^\d{8}$/.test(dni.trim())) {
    const error: any = new Error('El DNI debe contener exactamente 8 dígitos numéricos');
    error.statusCode = 400;
    throw error;
  }
}

export function validarTelefono(telefono: string | null | undefined): void {
  if (telefono && !/^\d{9}$/.test(telefono.trim())) {
    const error: any = new Error('El teléfono debe contener exactamente 9 dígitos numéricos');
    error.statusCode = 400;
    throw error;
  }
}
