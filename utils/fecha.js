exports.validarFecha = (fecha) => /^\d{4}-\d{2}-\d{2}$/.test(fecha);
exports.validarHora  = (hora)  => /^\d{2}:\d{2}$/.test(hora);
exports.validarFechaHora = (fecha, hora) => {
  const fechaValida = this.validarFecha(fecha);
  const horaValida  = this.validarHora(hora);
  return fechaValida && horaValida;
};