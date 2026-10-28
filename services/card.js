import prisma from "../lib/prisma.js";
import {
  accessibleContentWhere,
  authorSelect,
  canManage,
  hasCourse,
} from "../lib/access.js";

const cardInclude = {
  topic: { include: { subject: true } },
  hints: { where: { active: true } },
  author: { select: authorSelect },
};

export const getCardsService = async (
  user,
  { topicId, authorId, subjectId },
) => {
  return await prisma.card.findMany({
    where: {
      active: true,
      ...(await accessibleContentWhere(user)),
      ...(topicId && { topicId: Number(topicId) }),
      ...(authorId && { authorId: Number(authorId) }),
      ...(subjectId && { topic: { subjectId: Number(subjectId) } }),
    },
    include: cardInclude,
  });
};

export const getCardByIdService = async (user, id) => {
  return await prisma.card.findFirst({
    where: {
      id: Number(id),
      active: true,
      ...(await accessibleContentWhere(user)),
    },
    include: cardInclude,
  });
};

export const createCardService = async (
  user,
  { question, answer, topicId },
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

  return await prisma.card.create({
    data: {
      question,
      answer,
      topicId,
      authorId: user.id,
    },
    include: cardInclude,
  });
};

export const updateCardService = async (
  user,
  id,
  { question, answer, topicId },
) => {
  const parsedId = Number(id);

  const existingCard = await prisma.card.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingCard) {
    const error = new Error("Tarjeta no encontrada");
    error.status = 404;
    throw error;
  }

  if (!canManage(user, existingCard.authorId)) {
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
      topicId !== existingCard.topicId &&
      !(await hasCourse(existingCard.authorId, topicExists.subjectId))
    ) {
      const error = new Error("Primero hay que crear el curso de esta materia");
      error.status = 403;
      throw error;
    }
  }

  return await prisma.card.update({
    where: { id: parsedId },
    data: {
      ...(question !== undefined && { question }),
      ...(answer !== undefined && { answer }),
      ...(topicId !== undefined && { topicId }),
    },
    include: cardInclude,
  });
};

export const deleteCardService = async (user, id) => {
  const parsedId = Number(id);

  const existingCard = await prisma.card.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingCard) {
    const error = new Error("Tarjeta no encontrada");
    error.status = 404;
    throw error;
  }

  if (!canManage(user, existingCard.authorId)) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  await prisma.card.update({
    where: { id: parsedId },
    data: { active: false },
  });

  return { message: "Tarjeta eliminada correctamente" };
};
