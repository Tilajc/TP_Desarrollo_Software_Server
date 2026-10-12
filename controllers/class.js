import prisma from "../lib/prisma.js";

const classInclude = {
  teacher: {
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
      role: true,
    },
  },
  subject: true,
};

export const getClasses = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      where: { active: true },
      include: classInclude,
    });

    return res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return res.status(500).json({ message: "Error al obtener las clases" });
  }
};

export const getClassById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const classItem = await prisma.class.findFirst({
      where: { id, active: true },
      include: {
        ...classInclude,
        classSubscriptions: { where: { active: true } },
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

    const teacherExists = await prisma.user.findFirst({
      where: { id: teacherId, role: "TEACHER", active: true },
    });

    if (!teacherExists) {
      return res.status(404).json({
        message: "El profesor especificado no existe o no está activo",
      });
    }

    const subjectExists = await prisma.subject.findFirst({
      where: { id: subjectId, active: true },
    });

    if (!subjectExists) {
      return res.status(404).json({
        message: "La materia especificada no existe o no está activa",
      });
    }

    const newClass = await prisma.class.create({
      data: {
        year,
        teacherId,
        subjectId,
      },
      include: classInclude,
    });

    return res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    return res.status(500).json({ message: "Error al crear la clase" });
  }
};

export const updateClass = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { year, teacherId, subjectId } = req.body;

    const existingClass = await prisma.class.findFirst({
      where: { id, active: true },
    });

    if (!existingClass) {
      return res.status(404).json({ message: "Clase no encontrada" });
    }

    if (teacherId !== undefined) {
      const teacherExists = await prisma.user.findFirst({
        where: { id: teacherId, role: "TEACHER", active: true },
      });

      if (!teacherExists) {
        return res.status(404).json({
          message: "El profesor especificado no existe o no está activo",
        });
      }
    }

    if (subjectId !== undefined) {
      const subjectExists = await prisma.subject.findFirst({
        where: { id: subjectId, active: true },
      });

      if (!subjectExists) {
        return res.status(404).json({
          message: "La materia especificada no existe o no está activa",
        });
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        ...(year !== undefined && { year }),
        ...(teacherId !== undefined && { teacherId }),
        ...(subjectId !== undefined && { subjectId }),
      },
      include: classInclude,
    });

    return res.status(200).json(updatedClass);
  } catch (error) {
    console.error("Error updating class:", error);
    return res.status(500).json({ message: "Error al actualizar la clase" });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingClass = await prisma.class.findFirst({
      where: { id, active: true },
    });

    if (!existingClass) {
      return res.status(404).json({ message: "Clase no encontrada" });
    }

    await prisma.class.update({
      where: { id },
      data: { active: false },
    });

    return res.status(200).json({ message: "Clase eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting class:", error);
    return res.status(500).json({ message: "Error al eliminar la clase" });
  }
};
