const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const profesionalService = require('../services/profesional.service');

exports.crearProfesional = async (req, res) => {
  const { cedula, nombres, apellidos, email,
    telefono, descripcion, servicio_id } = req.body;
  try {
    const profesional = await profesionalService.crearProfesional(cedula, nombres, apellidos, email,
      telefono, descripcion, servicio_id);
    res.status(201).json(profesional);
  } catch (error) {
    console.error('Error creando profesional:', error);

    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Servicio no existe' });
    }
    return res.status(500).json({ error: 'Error al crear el profesional' });
  }
};

exports.obtenerProfesionales = async (req, res) => {
  try {
    const profesionales = await profesionalService.obtenerProfesionales();
    res.status(200).json(profesionales);
  } catch (error) {
    console.error('Error en obtenerProfesionales:', error);
    res.status(500).json({ error: 'Error al obtener los profesionales' });
  }
};

exports.deleteProfesional = async (req, res) => {
  const { id } = req.params;
  try {
    const profesional = await profesionalService.deleteProfesional(id);
    res.status(200).json({ message: 'Profesional eliminado correctamente', profesional });
  } catch (error) {
    console.error('Error eliminando profesional:', error);
    res.status(500).json({ error: 'Error al eliminar el profesional' });
  }
};
