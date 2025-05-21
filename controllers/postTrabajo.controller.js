const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.crearPostulacionTrabajo = async (req, res) => {
    const usuarioId = req.user.userId;
    const { trabajoId, profesion, area, modalidadId, jornada } = req.body;

    const estadoPostulacion = 1;
    
    try {
        //Validar que el usuario existe
        const usuario = await prisma.usuario.findUnique({
            where: {
                id: usuarioId
            },
            select: {
                pais: true,
                email: true,
                ciudad: true,
                discapacidad: true
            }
        });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        //Validar que el pais existe
        const paisId = await prisma.paises.findFirst({
            where: { nombre: usuario.pais },
            select: { id: true }
        });
        if (!paisId) {
        return res.status(400).json({ error: "País del usuario no encontrado en la base de datos" });
        }

        //Validar que el trabajo existe
        const trabajo = await prisma.trabajos.findUnique({
            where: { id: trabajoId }
        });
        if (!trabajo) {
            return res.status(404).json({ error: "Trabajo no encontrado" });
        }

        const postulacion = await prisma.postulacion_empleos.create({
            data: {
                trabajo_id: trabajoId,
                usuario_id: usuarioId,
                profesion,
                area,
                modalidad_id: modalidadId,
                jornada,
                pais_id: paisId.id,
                email: usuario.email,
                ciudad: usuario.ciudad,
                discapacidad: usuario.discapacidad,
                estado_id: estadoPostulacion,
            }, 
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
        res.status(201).json(postulacion);
    } catch (error) {
        console.error("Error al crear la postulacion:", error);
        res.status(500).json({ error: "Error al crear la postulacion" });
        }
};

//aprobar postulacion
exports.aprobarPostulacion = async (req, res) => {
    const postulacionId  = req.params.id;
    const estadoId = 2; // Estado "Aprobada"

    try {
        // Verificar si la postulacion existe
        const postulacion = await prisma.postulacion_empleos.findUnique({
            where: { id: Number(postulacionId) }
        });
        if (!postulacion) {
            return res.status(404).json({ error: "Postulación no encontrada" });
        }
        const postulacionActualizada = await prisma.postulacion_empleos.update({
            where: { id: Number(postulacionId) },
            data: { estado_id: estadoId },
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
        const postulacion = await prisma.postulacion_empleos.findUnique({
            where: { id: Number(postulacionId) }
        });
        if (!postulacion) {
            return res.status(404).json({ error: "Postulación no encontrada" });
        }

        const postulacionActualizada = await prisma.postulacion_empleos.update({
            where: { id: Number(postulacionId) },
            data: { estado_id: estadoId },
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
        res.status(200).json(postulacion);
    } catch (error) {
        console.error("Error al rechazar la postulacion:", error);
        res.status(500).json({ error: "Error al rechazar la postulacion" });
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
