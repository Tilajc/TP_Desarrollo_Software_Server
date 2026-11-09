import prisma from "../lib/prisma.js";
import { normalizeText } from "../lib/text.js";

const assertUniqueName = async (name, excludeId) => {
  const subjects = await prisma.subject.findMany({
    where: { active: true, ...(excludeId && { id: { not: excludeId } }) },
    select: { name: true },
  });

  const wanted = normalizeText(name);

  if (subjects.some((subject) => normalizeText(subject.name) === wanted)) {
    const error = new Error("Ya existe una materia con ese nombre");
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
    where: { id: parsedId, active: true },
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

  await prisma.$transaction([
    prisma.hint.updateMany({
      where: { active: true, card: { topic: { subjectId: parsedId } } },
      data: { active: false },
    }),
    prisma.card.updateMany({
      where: { active: true, topic: { subjectId: parsedId } },
      data: { active: false },
    }),
    prisma.summary.updateMany({
      where: { active: true, topic: { subjectId: parsedId } },
      data: { active: false },
    }),
    prisma.topic.updateMany({
      where: { active: true, subjectId: parsedId },
      data: { active: false },
    }),
    prisma.course.updateMany({
      where: { active: true, subjectId: parsedId },
      data: { active: false },
    }),
    prisma.subject.update({
      where: { id: parsedId },
      data: { active: false },
    }),
  ]);

  return { message: "Materia eliminada correctamente" };
};
