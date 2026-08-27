import prisma from "../lib/prisma.js";

export const getClasses = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        subject: true,
      },
    });

    return res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching clases:", error);
    return res.status(500).json({ message: "Error al obtener las clases" });
  }
};

export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const classItem = await prisma.class.findUnique({
      where: { id: Number(id) },
      include: {
        teacher: true,
        subject: true,
        classSubscriptions: true,
      },
    });

    if (!classItem) {
      return res.status(404).json({ message: "Clase no encontrada" });
    }

    return res.status(200).json(classItem);
  } catch (error) {
    console.error("Error fetching class:", error);
    return res.status(500).json({ message: "Error al obtener la clase" });
  }
};

export const createClass = async (req, res) => {
  try {
    const { year, teacherId, subjectId } = req.body;

    const [teacherExists, subjectExists] = await Promise.all([
      prisma.user.findUnique({
        where: { id: teacherId, role: "TEACHER", active: true },
      }),
      prisma.subject.findUnique({ where: { id: subjectId, active: true } }),
    ]);

    if (!teacherExists) {
      return res
        .status(404)
        .json({ message: "El profesor especificado no existe" });
    }

    if (!subjectExists) {
      return res
        .status(404)
        .json({ message: "La materia especificada no existe" });
    }

    const newClass = await prisma.class.create({
      data: {
        year,
        teacherId,
        subjectId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        subject: true,
      },
    });

    return res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    return res.status(500).json({ message: "Error al crear la clase" });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existingClass = await prisma.class.findUnique({
      where: { id: Number(id) },
    });

    if (!existingClass) {
      return res.status(404).json({ message: "Clase no encontrada" });
    }

    if (data.teacherId) {
      const teacherExists = await prisma.user.findUnique({
        where: { id: data.teacherId, role: "TEACHER", active: true },
      });
      if (!teacherExists)
        return res.status(404).json({ message: "El profesor no existe" });
    }

    if (data.subjectId) {
      const subjectExists = await prisma.subject.findUnique({
        where: { id: data.subjectId },
      });
      if (!subjectExists)
        return res.status(404).json({ message: "La materia no existe" });
    }

    const updatedClass = await prisma.class.update({
      where: { id: Number(id) },
      data,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        subject: true,
      },
    });

    return res.status(200).json(updatedClass);
  } catch (error) {
    console.error("Error updating class:", error);
    return res.status(500).json({ message: "Error al actualizar la clase" });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const existingClass = await prisma.class.findUnique({
      where: { id: Number(id) },
    });

    if (!existingClass) {
      return res.status(404).json({ message: "Clase no encontrada" });
    }

    await prisma.class.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Clase eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting class:", error);

    return res.status(500).json({ message: "Error al eliminar la clase" });
  }
};
