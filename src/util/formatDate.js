// Utilidad para formatear fechas en formato local (es-AR).
export function formatearFechaISO(fechaISO) {
  const fecha = new Date(fechaISO);

  if (Number.isNaN(fecha.getTime())) {
    return 'Fecha no disponible';
  }

  const opciones = {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  return new Intl.DateTimeFormat('es-AR', opciones).format(fecha);
}
