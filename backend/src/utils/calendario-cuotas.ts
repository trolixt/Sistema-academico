export function crearCalendarioMensual(cicloInicio: string | Date): Array<{ periodo: string; vencimiento: string }> {
  const dateText = cicloInicio instanceof Date
    ? `${cicloInicio.getFullYear()}-${String(cicloInicio.getMonth() + 1).padStart(2, '0')}-${String(cicloInicio.getDate()).padStart(2, '0')}`
    : String(cicloInicio).slice(0, 10);
  const start = new Date(`${dateText}T00:00:00Z`);
  return Array.from({ length: 6 }, (_, offset) => {
    const monthDate = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + offset, 1));
    const monthEnd = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)).getUTCDate();
    const dueDay = Math.min(start.getUTCDate(), monthEnd);
    const periodo = `${monthDate.getUTCFullYear()}-${String(monthDate.getUTCMonth() + 1).padStart(2, '0')}`;
    const vencimiento = `${periodo}-${String(dueDay).padStart(2, '0')}`;
    return { periodo, vencimiento };
  });
}
