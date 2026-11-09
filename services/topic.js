import prisma from "../lib/prisma.js";
import { normalizeText } from "../lib/text.js";

const assertUniqueName = async (name, subjectId, excludeId) => {
  const topics = await prisma.topic.findMany({
    where: {
      active: true,
      subjectId,
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { name: true },
  });

  const wanted = normalizeText(name);

  if (topics.some((topic) => normalizeText(topic.name) === wanted)) {
    const error = new Error("Ya existe un tema con ese nombre en esta materia");
    error.status = 409;
    throw error;
  }
};

export const getTopicsService = async ({ subjectId }) => {
  return await prisma.topic.findMany({
    where: {
      active: true,
      ...(subjectId && { subjectId: Number(subjectId) }),
    },
    include: { subject: true },
  });
};

export const getTopicByIdService = async (id) => {
  return await prisma.topic.findFirst({
    where: { id: Number(id), active: true },
    include: { subject: true },
  });
};

export const createTopicService = async ({ name, subjectId }) => {
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

  await assertUniqueName(name, subjectId);

  return await prisma.topic.create({
    data: {
      name,
      subjectId,
    },
    include: { subject: true },
  });
};

export const updateTopicService = async (id, { name, subjectId }) => {
  const parsedId = Number(id);

  const existingTopic = await prisma.topic.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingTopic) {
    const error = new Error("Tema no encontrado");
    error.status = 404;
    throw error;
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

  if (name !== undefined || subjectId !== undefined) {
    await assertUniqueName(
      name ?? existingTopic.name,
      subjectId ?? existingTopic.subjectId,
      parsedId,
    );
  }

  return await prisma.topic.update({
    where: { id: parsedId },
    data: {
      ...(name !== undefined && { name }),
      ...(subjectId !== undefined && { subjectId }),
    },
    include: { subject: true },
  });
};

export const deleteTopicService = async (id) => {
  const parsedId = Number(id);

  const existingTopic = await prisma.topic.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingTopic) {
    const error = new Error("Tema no encontrado");
    error.status = 404;
    throw error;
  }

  await prisma.$transaction([
    prisma.hint.updateMany({
      where: { active: true, card: { topicId: parsedId } },
      data: { active: false },
    }),
    prisma.card.updateMany({
      where: { active: true, topicId: parsedId },
      data: { active: false },
    }),
    prisma.summary.updateMany({
      where: { active: true, topicId: parsedId },
      data: { active: false },
    }),
    prisma.topic.update({
      where: { id: parsedId },
      data: { active: false },
    }),
  ]);

  return { message: "Tema eliminado correctamente" };
};
