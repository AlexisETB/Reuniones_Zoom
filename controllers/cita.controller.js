const { getAccessToken, crearMeeting } = require('../utils/zoom');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.crearCita = async (req, res) => {
  const usuario_id     = req.user.userId;  
  const { servicio_id, profesional_id, fecha, hora, razon } = req.body;

  try {
    // 1.Validar existencia del servicio
    const servicio = await prisma.servicio.findUnique({
      where: { id: Number(servicio_id) }
    });
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // 2.Validar que el profesional existe y pertenece al servicio
    const profesional = await prisma.profesional.findUnique({
      where: { usuario_id: Number(profesional_id) }
    });
    if (!profesional || profesional.servicio_id !== servicio.id) {
      return res.status(404).json({ error: 'Profesional no válido para este servicio' });
    }

    // 3.Validar que la fecha y hora son válidas
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Usa YYYY-MM-DD' });
    }
    // Validar formato HH:MM
    if (!/^\d{2}:\d{2}$/.test(hora)) {
      return res.status(400).json({ error: 'Formato de hora inválido. Usa HH:MM' });
    }

    // Construir objeto Date para hora
    const horaDate = new Date(`${fecha}T${hora}:00`);
    if (isNaN(horaDate.getTime())) {
      return res.status(400).json({ error: 'Fecha u hora inválida' });
    }

    console.log(horaDate.toISOString()); // "2025-05-20T10:30:00.000Z"

    // 3. Crear la cita en estado 'pendiente'
    const nuevaCita = await prisma.cita.create({
      data: {
        usuario_id:     usuario_id,
        servicio_id:    Number(servicio_id),
        profesional_id: Number(profesional_id),
        fecha:         new Date(fecha),
        hora:          horaDate,
        razon,
        estado:        'pendiente'  
      },
      include: {
        usuario:     { select: { id: true, nombres: true, apellidos: true } },
        servicio:    { select: { id: true, nombre: true } },
        profesional: { select: { 
          usuarios: { select: { id: true, nombres: true, apellidos: true } }
        } }
      }
    });

    res.status(201).json({
      message: 'Cita creada, pendiente de aprobación',
      cita: nuevaCita
    });
  } catch (error) {
    console.error('Error al crear cita:', error.message);
    res.status(500).json({ error: 'Error interno al crear la cita' });
  }
};


// Aprobar cita
exports.aprobarCita = async (req, res) => {
  const citaId = parseInt(req.params.id);

  try {
    const cita = await prisma.cita.findUnique({
      where: { id: citaId },
      include: {
        profesional: { include: { usuarios: true } },
        usuario: true
      }
    });

    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

    const fechaStr  = cita.fecha.toISOString().split('T')[0];
    const fecha = new Date(fechaStr);

    // 1. Buscar si ya existe reunión del profesional ese día
    let reunion = await prisma.reunion.findFirst({
      where: {
        profesional_id: cita.profesional_id,
        fecha
      }
    });

    // 2. Si no existe, crear reunión en Zoom y guardarla
    if (!reunion) {
      const token = await getAccessToken();

      const nuevaReunionZoom = await crearMeeting(token, {
        topic: `Reuniones de ${cita.profesional.usuarios.nombres}`,
        start_time: cita.fecha.toISOString(),
        agenda: `Reunión diaria de ${cita.profesional.usuarios.nombres}`,
        password:   'Auto123'
      });

      reunion = await prisma.reunion.create({
        data: {
          uuid: nuevaReunionZoom.uuid,
          meeting_id: String(nuevaReunionZoom.id),
          start_time: new Date(nuevaReunionZoom.start_time),
          duration: nuevaReunionZoom.duration,
          topic: nuevaReunionZoom.topic,
          agenda:       nuevaReunionZoom.agenda,
          start_url: nuevaReunionZoom.start_url,
          join_url: nuevaReunionZoom.join_url,
          password: nuevaReunionZoom.password,
          profesional: {
            connect: { usuario_id: cita.profesional_id }
          },
          fecha
        }
      });
      
    }

    // 3. Actualizar la cita con la reunión y marcar como aprobada
    const citaActualizada = await prisma.cita.update({
      where: { id: cita.id },
      data: {
        estado: 'aprobada',
        reunion: {
      connect: { id: reunion.id }
    }
      },
      include: {
        profesional: { include: { usuarios: true } },
        reunion: true
      }
    });

    res.json({ message: 'Cita aprobada y reunión asignada', cita: citaActualizada });

  } catch (error) {
    console.error('Error al aprobar cita:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al aprobar cita' });
  }
};

exports.obtenerCitasUsuario = async (req, res) => {
    const usuarioId = req.user.id;
  
    try {
      const citas = await prisma.cita.findMany({
        where: {
          ususario_id: usuarioId,
          estado: 'aprobada'
        },
        include: {
          reunion: true,
          profesional: true,
          servicio: true
        }
      });
  
      res.json(citas);
    } catch (error) {
      console.error('Error al obtener citas del usuario:', error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  exports.obtenerReunionDelDia = async (req, res) => {
    const profesionalId = req.user.id; // Este usuario debe ser un profesional autenticado
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
  
    try {
      const reunion = await prisma.reunion.findFirst({
        where: {
          profesional_id: profesionalId,
          fecha: new Date(fecha)
        },
        include: {
          citas: {
            include: {
              usuario: true
            }
          }
        }
      });
  
      if (!reunion) {
        return res.status(404).json({ mensaje: 'No hay reunión programada para hoy.' });
      }
  
      res.json(reunion);
    } catch (error) {
      console.error('Error al obtener reunión del profesional:', error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  exports.obtenerCitasPendientes = async (req, res) => {
    try {
      const citas = await prisma.cita.findMany({
        where: { estado: 'pendiente' },
        include: {
          usuario: true,
          servicio: true,
          profesional: true
        }
      });
  
      res.json(citas);
    } catch (error) {
      console.error('Error al obtener citas pendientes:', error.message);
      res.status(500).json({ error: 'Error al obtener citas' });
    }
  };

  exports.rechazarCita = async (req, res) => {
    const citaId = parseInt(req.params.id);
  
    try {
      const cita = await prisma.cita.findUnique({ 
        where: { id: citaId },
        include: { profesional: true, usuario: true }
       });
  
      if (!cita) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
  
      const citaActualizada = await prisma.cita.update({
        where: { id: citaId },
        data: {
          estado: 'denegada'
        }
      });
  
      res.json({ message: 'Cita rechazada correctamente.', cita: citaActualizada });
    } catch (error) {
      console.error('Error al rechazar cita:', error.message);
      res.status(500).json({ error: 'Error al rechazar cita' });
    }
  };

  // Citas del usuario por profesional
exports.obtenerCitasPorProfesional = async (req, res) => {
  const usuarioId     = req.user.id;
  const profesionalId = Number(req.params.profesionalId);

  if (isNaN(profesionalId)) {
    return res.status(400).json({ error: 'ID de profesional inválido' });
  }

  try {
    const citas = await prisma.cita.findMany({
      where: {
        usuario_id: usuarioId,
        profesional_id: profesionalId,
        estado: 'aprobada'
      },
      include: {
        servicio:    true,
        profesional: {
          include: { usuarios: true } 
        },
        reunion:     true
      }
    });
    res.json(citas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener citas por profesional' });
  }
};
//Citas del usuario por fecha
exports.obtenerCitasPorFecha = async (req, res) => {
  const usuarioId = req.user.id;
  const fechaStr  = req.params.fecha;
  const fecha = new Date(fechaStr);
  try {
    const citas = await prisma.cita.findMany({
      where: {
        usuarioId,
        fecha,
        estado: 'aprobada'
      },
      include: { servicio: true, profesional: true, reunion: true }
    });
    res.json(citas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener citas por fecha' });
  }
};

// Profesional: citas por usuario
// GET /api/citas/profesional/usuario/:usuarioId
exports.obtenerCitasProfesionalPorUsuario = async (req, res) => {

  const profesionalId = Number(req.user.userId);  
  const usuarioId     = Number(req.params.usuarioId);

  if (isNaN(usuarioId)) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }

  try {
    const citas = await prisma.cita.findMany({
      where: {
        profesional_id: profesionalId,
        usuario_id: usuarioId,
        estado: 'aprobada'
      },
      include: { usuario: true, servicio: true, reunion: true }
    });
    res.json(citas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener citas por usuario' });
  }
};


// Profesional: citas por fecha
// GET /api/citas/profesional/fecha/:fecha
exports.obtenerCitasProfesionalPorFecha = async (req, res) => {
  const profesionalId = req.user.id;
  const fechaStr     = req.params.fecha;
  const fecha        = new Date(fechaStr);

  try {
    const citas = await prisma.cita.findMany({
      where: {
        profesional_id: profesionalId,
        fecha,
        estado: 'aprobada'
      },
      include: { usuario: true, servicio: true, reunion: true }
    });
    res.json(citas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener citas por fecha' });
  }
};

  
  
  
  
