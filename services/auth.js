import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const loginService = async (body) => {
  const user = await prisma.user.findFirst({
    where: { email: body.email, active: true },
  });

  const passwordMatches =
    user && (await bcrypt.compare(body.password, user.password));

  if (!passwordMatches) {
    const error = new Error("Usuario o contraseña incorrectos");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
  );

  const returning = {
    token,
    user: {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };

  return returning;
};

export const updateProfileService = async (
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
    },
  });
};
