import prisma from "../lib/prisma.js";
import { normalizeText } from "../lib/text.js";

const assertUniqueName = async (
  name,
  excludeId,
  message = "Ya existe una materia con ese nombre puede que esté eliminada",
) => {
  const subjects = await prisma.subject.findMany({
    where: { ...(excludeId && { id: { not: excludeId } }) },
    select: { name: true },
  });

  const wanted = normalizeText(name);

  if (subjects.some((subject) => normalizeText(subject.name) === wanted)) {
    const error = new Error(message);
    error.status = 409;
    throw error;
  }
};

export const getSubjectsService = async () => {
  return await prisma.subject.findMany({
    where: { active: true },
  });
};

export const getSubjectByIdService = async (id) => {
  return await prisma.subject.findFirst({
    where: { id: Number(id), active: true },
  });
};

export const createSubjectService = async ({ name, description }) => {
  await assertUniqueName(name);

  return await prisma.subject.create({
    data: {
      name,
      description,
    },
  });
};

export const updateSubjectService = async (id, { name, description }) => {
  const parsedId = Number(id);

  const existingSubject = await prisma.subject.findFirst({
    where: { id: parsedId },
  });

  if (!existingSubject) {
    const error = new Error("Materia no encontrada");
    error.status = 404;
    throw error;
  }

  if (name !== undefined) {
    await assertUniqueName(name, parsedId);
  }

  return await prisma.subject.update({
    where: { id: parsedId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
    },
  });
};

export const deleteSubjectService = async (id) => {
  const parsedId = Number(id);

  const existingSubject = await prisma.subject.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingSubject) {
    const error = new Error("Materia no encontrada");
    error.status = 404;
    throw error;
  }

  const deletedAt = new Date();

  await prisma.$transaction([
    prisma.hint.updateMany({
      where: { active: true, card: { topic: { subjectId: parsedId } } },
      data: { active: false, deletedAt },
    }),
    prisma.card.updateMany({
      where: { active: true, topic: { subjectId: parsedId } },
      data: { active: false, deletedAt },
    }),
    prisma.summary.updateMany({
      where: { active: true, topic: { subjectId: parsedId } },
      data: { active: false, deletedAt },
    }),
    prisma.topic.updateMany({
      where: { active: true, subjectId: parsedId },
      data: { active: false, deletedAt },
    }),
    prisma.course.updateMany({
      where: { active: true, subjectId: parsedId },
      data: { active: false, deletedAt },
    }),
    prisma.subject.update({
      where: { id: parsedId },
      data: { active: false, deletedAt },
    }),
  ]);

  return { message: "Materia eliminada correctamente" };
};

export const getDeletedSubjectsService = async () => {
  return await prisma.subject.findMany({
    where: { active: false },
    orderBy: { deletedAt: "desc" },
  });
};

export const restoreSubjectService = async (id) => {
  const parsedId = Number(id);

  const subject = await prisma.subject.findFirst({
    where: { id: parsedId },
  });

  if (!subject) {
    const error = new Error("Materia no encontrada");
    error.status = 404;
    throw error;
  }

  if (subject.active) {
    const error = new Error("La materia no está eliminada");
    error.status = 409;
    throw error;
  }

  await assertUniqueName(
    subject.name,
    parsedId,
    "Ya existe una materia activa con ese nombre. Cambiale el nombre o eliminala antes de restaurar esta.",
  );

  const restored = { active: true, deletedAt: null };
  const { deletedAt } = subject;

  const topics = await prisma.topic.findMany({
    where: { subjectId: parsedId },
    select: { id: true },
  });
  const topicIds = topics.map((t) => t.id);

  const cards = await prisma.card.findMany({
    where: { topicId: { in: topicIds } },
    select: { id: true },
  });
  const cardIds = cards.map((c) => c.id);

  await prisma.$transaction([
    ...(deletedAt
      ? [
          prisma.hint.updateMany({
            where: { active: false, deletedAt, cardId: { in: cardIds } },
            data: restored,
          }),
          prisma.card.updateMany({
            where: { active: false, deletedAt, topicId: { in: topicIds } },
            data: restored,
          }),
          prisma.summary.updateMany({
            where: { active: false, deletedAt, topicId: { in: topicIds } },
            data: restored,
          }),
          prisma.topic.updateMany({
            where: { active: false, deletedAt, subjectId: parsedId },
            data: restored,
          }),
          prisma.course.updateMany({
            where: { active: false, deletedAt, subjectId: parsedId },
            data: restored,
          }),
        ]
      : []),
    prisma.subject.update({
      where: { id: parsedId },
      data: restored,
    }),
  ]);

  return { message: "Materia restaurada correctamente" };
};
