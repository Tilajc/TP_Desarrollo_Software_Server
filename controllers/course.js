import prisma from "../lib/prisma.js";
import { authorSelect, canManage, isAdmin } from "../lib/access.js";

const courseInclude = {
  author: { select: authorSelect },
  subject: true,
};

const forbidden = (res) =>
  res
    .status(403)
    .json({ message: "No tenés permisos para realizar esta acción" });

export const getCourses = async (req, res) => {
  try {
    const { authorId, subjectId } = req.query;

    const courses = await prisma.course.findMany({
      where: {
        active: true,
        ...(authorId && { authorId: Number(authorId) }),
        ...(subjectId && { subjectId: Number(subjectId) }),
      },
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

    if (!canManage(req.user, courseItem.authorId)) {
      delete courseItem.courseSubscriptions;
    }

    return res.status(200).json(courseItem);
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({ message: "Error al obtener el curso" });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const authorId = req.body.authorId ?? req.user.id;

    if (authorId !== req.user.id && !isAdmin(req.user)) {
      return forbidden(res);
    }

    const authorExists = await prisma.user.findFirst({
      where: { id: authorId, active: true },
    });

    if (!authorExists) {
      return res.status(404).json({
        message: "El autor especificado no existe o no está activo",
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

    const existingCourse = await prisma.course.findUnique({
      where: { authorId_subjectId: { authorId, subjectId } },
    });

    if (existingCourse?.active) {
      return res.status(409).json({
        message: "El autor ya tiene un curso para esta materia",
      });
    }

    const course = existingCourse
      ? await prisma.course.update({
          where: { id: existingCourse.id },
          data: { active: true },
          include: courseInclude,
        })
      : await prisma.course.create({
          data: { authorId, subjectId },
          include: courseInclude,
        });

    return res.status(201).json(course);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "El autor ya tiene un curso para esta materia",
      });
    }

    console.error("Error creating course:", error);
    return res.status(500).json({ message: "Error al crear el curso" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { authorId, subjectId } = req.body;

    const existingCourse = await prisma.course.findFirst({
      where: { id, active: true },
    });

    if (!existingCourse) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    if (!canManage(req.user, existingCourse.authorId)) {
      return forbidden(res);
    }

    if (
      authorId !== undefined &&
      authorId !== existingCourse.authorId &&
      !isAdmin(req.user)
    ) {
      return forbidden(res);
    }

    if (authorId !== undefined) {
      const authorExists = await prisma.user.findFirst({
        where: { id: authorId, active: true },
      });

      if (!authorExists) {
        return res.status(404).json({
          message: "El autor especificado no existe o no está activo",
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
        ...(authorId !== undefined && { authorId }),
        ...(subjectId !== undefined && { subjectId }),
      },
      include: courseInclude,
    });

    return res.status(200).json(updatedCourse);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "El autor ya tiene un curso para esta materia",
      });
    }

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

    if (!canManage(req.user, existingCourse.authorId)) {
      return forbidden(res);
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
