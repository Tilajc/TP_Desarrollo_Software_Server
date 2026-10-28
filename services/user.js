import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

const userSelect = {
  id: true,
  name: true,
  lastName: true,
  email: true,
  role: true,
};

export const getUsersService = async () => {
  return await prisma.user.findMany({
    where: { active: true },
    select: userSelect,
  });
};

export const getUserByIdService = async (id) => {
  return await prisma.user.findFirst({
    where: { id: Number(id), active: true },
    select: userSelect,
  });
};

export const createUserService = async ({
  name,
  lastName,
  email,
  password,
  role,
}) => {
  const emailInUse = await prisma.user.findUnique({
    where: { email },
  });

  if (emailInUse) {
    const error = new Error("El email ya está registrado");
    error.status = 409;
    throw error;
  }

  return await prisma.user.create({
    data: {
      name,
      lastName,
      email,
      password: await bcrypt.hash(password, 10),
      role,
    },
    select: userSelect,
  });
};

export const updateUserService = async (
  id,
  { name, lastName, email, password, role },
) => {
  const parsedId = Number(id);

  const existingUser = await prisma.user.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingUser) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  if (email !== undefined && email !== existingUser.email) {
    const emailInUse = await prisma.user.findUnique({
      where: { email },
    });

    if (emailInUse) {
      const error = new Error("El email ya está registrado");
      error.status = 409;
      throw error;
    }
  }

  return await prisma.user.update({
    where: { id: parsedId },
    data: {
      ...(name !== undefined && { name }),
      ...(lastName !== undefined && { lastName }),
      ...(email !== undefined && { email }),
      ...(password !== undefined && {
        password: await bcrypt.hash(password, 10),
      }),
      ...(role !== undefined && { role }),
    },
    select: userSelect,
  });
};

export const deleteUserService = async (id) => {
  const parsedId = Number(id);

  const existingUser = await prisma.user.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingUser) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  await prisma.user.update({
    where: { id: parsedId },
    data: { active: false },
  });

  return { message: "Usuario eliminado correctamente" };
};

export const registerUserService = async ({
  name,
  lastName,
  email,
  password,
}) => {
  const emailInUse = await prisma.user.findUnique({
    where: { email },
  });

  if (emailInUse) {
    const error = new Error("El email ya está registrado");
    error.status = 409;
    throw error;
  }

  return await prisma.user.create({
    data: {
      name,
      lastName,
      email,
      password: await bcrypt.hash(password, 10),
    },
    select: userSelect,
  });
};

export const editProfileService = async (userId, { name, lastName }) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(lastName !== undefined && { lastName }),
    },
    select: userSelect,
  });
};
