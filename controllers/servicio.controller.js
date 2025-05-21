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

exports.deleteServicio = async (req, res) => {
  const { id } = req.params;
  try {
    const servicio = await prisma.servicio.findUnique({
      where: { id }
    });
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    await prisma.servicio.delete({
      where: { id }
    });
    res.status(200).json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el servicio' });
  }
}
