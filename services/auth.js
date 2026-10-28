import prisma from "../lib/prisma.js";
import { accessibleContentWhere, canManage } from "../lib/access.js";

const hintInclude = {
  card: { include: { topic: true } },
};

export const getHintsService = async (user, cardId) => {
  return await prisma.hint.findMany({
    where: {
      active: true,
      card: await accessibleContentWhere(user),
      ...(cardId && { cardId: Number(cardId) }),
    },
    include: hintInclude,
  });
};

export const getHintByIdService = async (user, id) => {
  return await prisma.hint.findFirst({
    where: {
      id: Number(id),
      active: true,
      card: await accessibleContentWhere(user),
    },
  });
};

export const createHintService = async (user, { content, cardId }) => {
  const cardExists = await prisma.card.findFirst({
    where: { id: cardId, active: true },
  });

  if (!cardExists) {
    const error = new Error(
      "La tarjeta especificada no existe o no está activa",
    );
    error.status = 404;
    throw error;
  }

  if (!canManage(user, cardExists.authorId)) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  return await prisma.hint.create({
    data: {
      content,
      cardId,
    },
  });
};

export const updateHintService = async (user, id, { content, cardId }) => {
  const parsedId = Number(id);

  const existingHint = await prisma.hint.findFirst({
    where: { id: parsedId, active: true },
    include: { card: { select: { authorId: true } } },
  });

  if (!existingHint) {
    const error = new Error("Pista no encontrada");
    error.status = 404;
    throw error;
  }

  if (!canManage(user, existingHint.card.authorId)) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  if (cardId !== undefined) {
    const cardExists = await prisma.card.findFirst({
      where: { id: cardId, active: true },
    });

    if (!cardExists) {
      const error = new Error(
        "La tarjeta especificada no existe o no está activa",
      );
      error.status = 404;
      throw error;
    }

    if (!canManage(user, cardExists.authorId)) {
      const error = new Error("No tenés permisos para realizar esta acción");
      error.status = 403;
      throw error;
    }
  }

  return await prisma.hint.update({
    where: { id: parsedId },
    data: {
      ...(content !== undefined && { content }),
      ...(cardId !== undefined && { cardId }),
    },
  });
};

export const deleteHintService = async (user, id) => {
  const parsedId = Number(id);

  const existingHint = await prisma.hint.findFirst({
    where: { id: parsedId, active: true },
    include: { card: { select: { authorId: true } } },
  });

  if (!existingHint) {
    const error = new Error("Pista no encontrada");
    error.status = 404;
    throw error;
  }

  if (!canManage(user, existingHint.card.authorId)) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  await prisma.hint.update({
    where: { id: parsedId },
    data: { active: false },
  });

  return { message: "Pista eliminada correctamente" };
};
