import prisma from "../lib/prisma.js";

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

  await prisma.subject.update({
    where: { id: parsedId },
    data: { active: false },
  });

  return { message: "Materia eliminada correctamente" };
};
