const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.crearServicio = async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const servicio = await prisma.servicio.create({
      data: { nombre, descripcion }
    });
    res.status(201).json(servicio);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el servicio' });
  }
};

exports.obtenerServicios = async (req, res) => {
  try {
    const servicios = await prisma.servicio.findMany();
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los servicios' });
  }
};
