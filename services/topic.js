import prisma from "../lib/prisma.js";

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

  await prisma.topic.update({
    where: { id: parsedId },
    data: { active: false },
  });

  return { message: "Tema eliminado correctamente" };
};
