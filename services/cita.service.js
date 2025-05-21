const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validarFecha, validarHora } = require('../utils/fecha');

exports.crearCita = async ({usuario_id, servicio_id, profesional_id, fecha, hora, razon }) => {
  const servicio = await prisma.servicio.findUnique({ where: { id: Number(servicio_id) } });
  if (!servicio) throw { status: 404, message: 'Servicio no encontrado' };

  const profesional = await prisma.profesional.findUnique({ where: { usuario_id: Number(profesional_id) } });
  if (!profesional || profesional.servicio_id !== servicio.id) {
    throw { status: 400, message: 'Profesional no válido para este servicio' };
  }

  if (!validarFecha(fecha) || !validarHora(hora)) {
    throw { status: 400, message: 'Formato de fecha u hora inválido' };
  }

  const horaDate = new Date(`${fecha}T${hora}:00`);
  if (isNaN(horaDate)) throw { status: 400, message: 'Fecha y hora no válidas' };

  const nuevaCita = await prisma.cita.create({
    data: {
      usuario_id: usuario_id,
      servicio_id: Number(servicio_id),
      profesional_id: Number(profesional_id),
      fecha: new Date(fecha),
      hora: horaDate,
      razon,
      estado_id: 1
    },
    include: {
      usuario:     { select: { id: true, nombres: true, apellidos: true } },
      servicio:    { select: { id: true, nombre: true } },
      profesional: {
        include: { usuarios: { select: { id: true, nombres: true, apellidos: true } } }
      }
    }
  });

  return nuevaCita;
};

exports.aprobarCita = async (citaId) => {
  const cita = await prisma.cita.findUnique({
    where: { id: citaId },
    include: {
      profesional: { include: { usuarios: true } },
      usuario: true
    }
  });

  if (!cita) throw { status: 404, message: 'Cita no encontrada' };

  const fechaDia = cita.fecha.toISOString().split('T')[0];
  const reunion = await crearReunionSiNoExiste(cita.profesional, fechaDia);

  return await prisma.cita.update({
    where: { id: cita.id },
    data: {
      estado_id: 2, // aprobada
      reunion:   { connect: { id: reunion.id } }
    },
    include: {
      profesional: { include: { usuarios: true } },
      reunion: true
    }
  });
};

exports.rechazarCita = async (citaId) => {
  const cita = await prisma.cita.findUnique({ where: { id: citaId } });
  if (!cita) throw { status: 404, message: 'Cita no encontrada' };

  return await prisma.cita.update({
    where: { id: citaId },
    data: { estado_id: 3 } // denegada
  });
};

exports.obtenerCitasPendientes = async () => {
  const citas = await prisma.cita.findMany({
    where: { estado_id: 1 },
    include: {
      usuario: true,
      servicio: true,
      profesional: true
    }
  });

  return citas;
};