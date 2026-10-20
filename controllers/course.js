import prisma from "../lib/prisma.js";

const courseInclude = {
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

export const getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { active: true },
      include: courseInclude,
    });

    return res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({ message: "Error al obtener los cursos" });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const courseItem = await prisma.course.findFirst({
      where: { id, active: true },
      include: {
        ...courseInclude,
        courseSubscriptions: { where: { active: true } },
      },
    });

    if (!courseItem) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    return res.status(200).json(courseItem);
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({ message: "Error al obtener el curso" });
  }
};

export const createCourse = async (req, res) => {
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

    const newCourse = await prisma.course.create({
      data: {
        year,
        teacherId,
        subjectId,
      },
      include: courseInclude,
    });

    return res.status(201).json(newCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({ message: "Error al crear el curso" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { year, teacherId, subjectId } = req.body;

    const existingCourse = await prisma.course.findFirst({
      where: { id, active: true },
    });

    if (!existingCourse) {
      return res.status(404).json({ message: "Curso no encontrado" });
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

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(year !== undefined && { year }),
        ...(teacherId !== undefined && { teacherId }),
        ...(subjectId !== undefined && { subjectId }),
      },
      include: courseInclude,
    });

    return res.status(200).json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({ message: "Error al actualizar el curso" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingCourse = await prisma.course.findFirst({
      where: { id, active: true },
    });

    if (!existingCourse) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    await prisma.course.update({
      where: { id },
      data: { active: false },
    });

    return res.status(200).json({ message: "Curso eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({ message: "Error al eliminar el curso" });
  }
};
