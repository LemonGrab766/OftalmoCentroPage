export function numberToHour(numeroDecimal) {
    // Convertir a horas
    const horas = Math.floor(numeroDecimal * 24);
    // Convertir el residuo a minutos
    const minutos = Math.round((numeroDecimal * 24 * 60) % 60);
  
    // Formatear a HH:MM
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }