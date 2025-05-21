const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const citaService = require('../services/trabajo.service');

exports.crearTrabajo = async (req, res) => {
    const { empresa, departamento, cargo, horario, color } = req.body;
    try {
        const Trabajo = await trabajoService.crearTrabajo(empresa, departamento, cargo, horario, color);
        res.status(201).json(Trabajo);
    } catch (error) {
        console.error('Error al crear trabajo:', error);
        res.status(500).json({ error: 'Error al crear trabajo' });
    }
};

//Eliminar trabajo
exports.eliminarTrabajo = async (req, res) => {
    const trabajoId = parseInt(req.params.id);
    try {
        const trabajo = await trabajoService.deleteTrabajo(trabajoId);
        res.status(200).json({ message: 'Trabajo eliminado', trabajo });
    } catch (error) {
        console.error('Error al eliminar trabajo:', error);
        res.status(500).json({ error: 'Error al eliminar trabajo' });
    }
};

//Obtener trabajos
exports.obtenerTrabajos = async (req, res) => {
    try {
        const trabajos = await trabajoService.obtenerTrabajos();
        if (trabajos.length === 0) {
            return res.status(404).json({ message: 'No hay trabajos disponibles' });
        }
        res.status(200).json(trabajos);
    } catch (error) {
        console.error('Error al obtener trabajos:', error);
        res.status(500).json({ error: 'Error al obtener trabajos' });
    }
};