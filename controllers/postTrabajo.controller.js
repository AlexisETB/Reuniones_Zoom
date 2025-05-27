const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const postTrabajoService = require('../services/postTrabajo.service');

exports.crearPostulacionTrabajo = async (req, res) => {
    const usuarioId = req.user.userId;
    const { trabajoId, profesion, area, modalidadId, jornada } = req.body;
    try {
        const postulacion = await postTrabajoService.crearPostulacionTrabajo(usuarioId, trabajoId, profesion, area, modalidadId, jornada);
        res.status(201).json(postulacion);
    } catch (error) {
        console.error("Error al crear la postulacion:", error);
        res.status(500).json({ error: "Error al crear la postulacion" });
        }
};
//Cancelar postulacion
exports.cancelarPostulacion = async (req, res) => {
    const postulacionId = req.params.id;
    const usuarioId = req.user.userId;

    try {
        const postulacion = await postTrabajoService.cancelarPostulacion(postulacionId, usuarioId);
        res.status(200).json(postulacion);
    } catch (error) {
        console.error("Error al cancelar la postulacion:", error);
        res.status(500).json({ error: "Error al cancelar la postulacion" });
    }
};

//aprobar postulacion
exports.aprobarPostulacion = async (req, res) => {
    const postulacionId  = req.params.id;
    const estadoId = 2; // Estado "Aprobada"

    try {
        const postulacion = await postTrabajoService.aprobarPostulacion(postulacionId, estadoId);
        res.status(200).json(postulacion);
    } catch (error) {
        console.error("Error al aprobar la postulacion:", error);
        res.status(500).json({ error: "Error al aprobar la postulacion" });
    }
};

// Rechazar postulacion
exports.rechazarPostulacion = async (req, res) => {
    const postulacionId  = req.params.id;
    const estadoId = 3; // Estado "Rechazada"
    try {
        const postulacion = await postTrabajoService.rechazarPostulacion(postulacionId, estadoId);
        res.status(200).json(postulacion);
    } catch (error) {
        console.error("Error al rechazar la postulacion:", error);
        res.status(500).json({ error: "Error al rechazar la postulacion" });
    }
};
// Obtener postulaciones pendientes
exports.obtenerPostulacionesPendientes = async (req, res) => {
    try {
        const postulaciones = await postTrabajoService.obtenerPostulacionesPendientes();
        if (postulaciones.length === 0) {
            return res.status(404).json({ message: 'No hay postulaciones pendientes' });
        }
        res.status(200).json(postulaciones);
    } catch (error) {
        console.error("Error al obtener las postulaciones:", error);
        res.status(500).json({ error: "Error al obtener las postulaciones" });
    }
};

// Obtener postulaciones por usuario
exports.obtenerPostulacionesPorUsuario = async (req, res) => {
    const usuarioId = req.user.userId;

    try {
        const postulaciones = await prisma.postulacion_empleos.findMany({
            where: { usuario_id: usuarioId },
            include: {
                trabajos: true,
                modalidades: true,
                paises: true,
                estados: true
            }
        });
        res.status(200).json(postulaciones);
    } catch (error) {
        console.error("Error al obtener las postulaciones:", error);
        res.status(500).json({ error: "Error al obtener las postulaciones" });
    }
};
// Obtener postulaciones por trabajo
exports.obtenerPostulacionesPorTrabajo = async (req, res) => {
    const trabajoId = req.params.id;

    try {
        const postulaciones = await prisma.postulacion_empleos.findMany({
            where: { trabajo_id: Number(trabajoId) },
            include: {
                trabajos: true,
                modalidades: true,
                paises: true,
                estados: true,
                usuarios: {
                    select: {
                        nombres: true,
                        apellidos: true
                    }
                }
            }
        });
        res.status(200).json(postulaciones);
    } catch (error) {
        console.error("Error al obtener las postulaciones:", error);
        res.status(500).json({ error: "Error al obtener las postulaciones" });
    }
};
// Obtener todas las postulaciones
exports.obtenerTodasPostulaciones = async (req, res) => {
    try {
        const postulaciones = await prisma.postulacion_empleos.findMany({
            include: {
                trabajos: true,
                modalidades: true,
                paises: true,
                estados: true,
                usuarios: {
                    select: {
                        nombres: true,
                        apellidos: true
                    }
                }
            }
        });
        res.status(200).json(postulaciones);
    } catch (error) {
        console.error("Error al obtener las postulaciones:", error);
        res.status(500).json({ error: "Error al obtener las postulaciones" });
    }
};
