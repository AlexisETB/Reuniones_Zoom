const { getAccessToken, crearMeeting } = require('../utils/zoom');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const citaService = require('../services/cita.service');

exports.crearCita = async (req, res) => {
  const usuario_id     = req.user.userId;  
  try {
    const cita = await citaService.crearCita({ ...req.body, usuario_id });
    res.status(201).json({ message: 'Cita creada', cita });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }

};

exports.aprobarCita = async (req, res) => {
  const citaId = parseInt(req.params.id);

  try {
    const cita = await citaService.aprobarCita(citaId);
    res.json({ message: 'Cita aprobada y reunión asignada', cita });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.rechazarCita = async (req, res) => {
    const citaId = parseInt(req.params.id);
    try {
      const cita = await citaService.rechazarCita(citaId);
      res.json({ message: 'Cita rechazada correctamente', cita });
    } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
      }
  };

exports.obtenerCitasPendientes = async (req, res) => {
    try {
      const citas = await citaService.obtenerCitasPendientes();
      if (citas.length === 0) {
        return res.status(404).json({ message: 'No hay citas pendientes' });
      }
      res.json(citas);
    } catch (error) {
      console.error('Error al obtener citas pendientes:', error.message);
      res.status(500).json({ error: 'Error al obtener citas' });
    }
  };


exports.obtenerCitasUsuario = async (req, res) => {
    const usuarioId = req.user.userId; // Este usuario debe ser un cliente autenticado
  
    try {
      const citas = await prisma.cita.findMany({
        where: {
          usuario_id: usuarioId,
          estado_id: 2
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

  // Citas del usuario por profesional
exports.obtenerCitasPorProfesional = async (req, res) => {
  const usuarioId     = req.user.userId;
  const profesionalId = Number(req.params.profesionalId);

  if (isNaN(profesionalId)) {
    return res.status(400).json({ error: 'ID de profesional inválido' });
  }

  try {
    const citas = await prisma.cita.findMany({
      where: {
        usuario_id: usuarioId,
        profesional_id: profesionalId,
        estado_id: 2
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
  const usuarioId = req.user.userId;
  const fechaStr  = req.params.fecha;
  const fecha = new Date(fechaStr);
  try {
    const citas = await prisma.cita.findMany({
      where: {
        usuario_id: usuarioId,
        fecha,
        estado_id: 2
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
        estado_id: 2
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
        estado_id: 2
      },
      include: { usuario: true, servicio: true, reunion: true }
    });
    res.json(citas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener citas por fecha' });
  }
};

  
  
  
  
