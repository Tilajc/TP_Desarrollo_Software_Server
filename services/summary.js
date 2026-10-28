import prisma from "../lib/prisma.js";
import {
  accessibleContentWhere,
  authorSelect,
  canManage,
  hasCourse,
} from "../lib/access.js";

const summaryInclude = {
  topic: { include: { subject: true } },
  author: { select: authorSelect },
};

export const getSummariesService = async (
  user,
  { topicId, authorId, subjectId },
) => {
  return await prisma.summary.findMany({
    where: {
      active: true,
      ...(await accessibleContentWhere(user)),
      ...(topicId && { topicId: Number(topicId) }),
      ...(authorId && { authorId: Number(authorId) }),
      ...(subjectId && { topic: { subjectId: Number(subjectId) } }),
    },
    include: summaryInclude,
  });
};

export const getSummaryByIdService = async (user, id) => {
  return await prisma.summary.findFirst({
    where: {
      id: Number(id),
      active: true,
      ...(await accessibleContentWhere(user)),
    },
  });
};

export const createSummaryService = async (
  user,
  { title, content, topicId },
) => {
  const topicExists = await prisma.topic.findFirst({
    where: { id: topicId, active: true },
  });

  if (!topicExists) {
    const error = new Error("El tema especificado no existe o no está activo");
    error.status = 404;
    throw error;
  }

  if (!(await hasCourse(user.id, topicExists.subjectId))) {
    const error = new Error("Primero hay que crear el curso de esta materia");
    error.status = 403;
    throw error;
  }

  return await prisma.summary.create({
    data: {
      title,
      content,
      topicId,
      authorId: user.id,
    },
  });
};

export const updateSummaryService = async (
  user,
  id,
  { title, content, topicId },
) => {
  const parsedId = Number(id);

  const existingSummary = await prisma.summary.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingSummary) {
    const error = new Error("Resumen no encontrado");
    error.status = 404;
    throw error;
  }

  if (!canManage(user, existingSummary.authorId)) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  if (topicId !== undefined) {
    const topicExists = await prisma.topic.findFirst({
      where: { id: topicId, active: true },
    });

    if (!topicExists) {
      const error = new Error(
        "El tema especificado no existe o no está activo",
      );
      error.status = 404;
      throw error;
    }

    if (
      topicId !== existingSummary.topicId &&
      !(await hasCourse(existingSummary.authorId, topicExists.subjectId))
    ) {
      const error = new Error("Primero hay que crear el curso de esta materia");
      error.status = 403;
      throw error;
    }
  }

  return await prisma.summary.update({
    where: { id: parsedId },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(topicId !== undefined && { topicId }),
    },
  });
};

export const deleteSummaryService = async (user, id) => {
  const parsedId = Number(id);

  const existingSummary = await prisma.summary.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingSummary) {
    const error = new Error("Resumen no encontrado");
    error.status = 404;
    throw error;
  }

  if (!canManage(user, existingSummary.authorId)) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  await prisma.summary.update({
    where: { id: parsedId },
    data: { active: false },
  });

  return { message: "Resumen eliminado correctamente" };
};
