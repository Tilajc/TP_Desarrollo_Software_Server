import prisma from "../lib/prisma.js";
import { authorSelect, canManage, isAdmin } from "../lib/access.js";

const courseInclude = {
  author: { select: authorSelect },
  subject: true,
};

export const getCoursesService = async ({ authorId, subjectId }) => {
  return await prisma.course.findMany({
    where: {
      active: true,
      ...(authorId && { authorId: Number(authorId) }),
      ...(subjectId && { subjectId: Number(subjectId) }),
    },
    include: {
      ...courseInclude,
      _count: {
        select: { courseSubscriptions: { where: { active: true } } },
      },
    },
  });
};

export const getCourseByIdService = async (user, id) => {
  const courseItem = await prisma.course.findFirst({
    where: { id: Number(id), active: true },
    include: {
      ...courseInclude,
      courseSubscriptions: { where: { active: true } },
    },
  });

  if (!courseItem) {
    const error = new Error("Curso no encontrado");
    error.status = 404;
    throw error;
  }

  if (!canManage(user, courseItem.authorId)) {
    delete courseItem.courseSubscriptions;
  }

  return courseItem;
};

export const createCourseService = async (
  user,
  { subjectId, authorId: inputAuthorId },
) => {
  const authorId = inputAuthorId ?? user.id;

  if (authorId !== user.id && !isAdmin(user)) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  const authorExists = await prisma.user.findFirst({
    where: { id: authorId, active: true },
  });

  if (!authorExists) {
    const error = new Error("El autor especificado no existe o no está activo");
    error.status = 404;
    throw error;
  }

  const subjectExists = await prisma.subject.findFirst({
    where: { id: subjectId, active: true },
  });

  if (!subjectExists) {
    const error = new Error(
      "La materia especificada no existe o no está activa",
    );
    error.status = 404;
    throw error;
  }

  const existingCourse = await prisma.course.findUnique({
    where: { authorId_subjectId: { authorId, subjectId } },
  });

  if (existingCourse?.active) {
    const error = new Error("El autor ya tiene un curso para esta materia");
    error.status = 409;
    throw error;
  }

  return existingCourse
    ? await prisma.course.update({
        where: { id: existingCourse.id },
        data: { active: true },
        include: courseInclude,
      })
    : await prisma.course.create({
        data: { authorId, subjectId },
        include: courseInclude,
      });
};

export const updateCourseService = async (
  user,
  id,
  { authorId, subjectId },
) => {
  const parsedId = Number(id);

  const existingCourse = await prisma.course.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingCourse) {
    const error = new Error("Curso no encontrado");
    error.status = 404;
    throw error;
  }

  if (!canManage(user, existingCourse.authorId)) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  if (
    authorId !== undefined &&
    authorId !== existingCourse.authorId &&
    !isAdmin(user)
  ) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  if (authorId !== undefined) {
    const authorExists = await prisma.user.findFirst({
      where: { id: authorId, active: true },
    });

    if (!authorExists) {
      const error = new Error(
        "El autor especificado no existe o no está activo",
      );
      error.status = 404;
      throw error;
    }
  }

  if (subjectId !== undefined) {
    const subjectExists = await prisma.subject.findFirst({
      where: { id: subjectId, active: true },
    });

    if (!subjectExists) {
      const error = new Error(
        "La materia especificada no existe o no está activa",
      );
      error.status = 404;
      throw error;
    }
  }

  return await prisma.course.update({
    where: { id: parsedId },
    data: {
      ...(authorId !== undefined && { authorId }),
      ...(subjectId !== undefined && { subjectId }),
    },
    include: courseInclude,
  });
};

export const deleteCourseService = async (user, id) => {
  const parsedId = Number(id);

  const existingCourse = await prisma.course.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingCourse) {
    const error = new Error("Curso no encontrado");
    error.status = 404;
    throw error;
  }

  if (!canManage(user, existingCourse.authorId)) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  await prisma.course.update({
    where: { id: parsedId },
    data: { active: false },
  });

  return { message: "Curso eliminado correctamente" };
};
