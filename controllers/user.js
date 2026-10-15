import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

const userSelect = {
  id: true,
  name: true,
  lastName: true,
  email: true,
  docket: true,
  role: true,
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { active: true },
      select: userSelect,
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Error al obtener los usuarios" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findFirst({
      where: { id, active: true },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Error al obtener el usuario" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, lastName, email, password, docket, role } = req.body;

    const emailInUse = await prisma.user.findUnique({
      where: { email },
    });

    if (emailInUse) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        lastName,
        email,
        password: await bcrypt.hash(password, 10),
        docket,
        role,
      },
      select: userSelect,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Error al crear el usuario" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, lastName, email, password, docket, role } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { id, active: true },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (email !== undefined && email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email },
      });

      if (emailInUse) {
        return res.status(409).json({ message: "El email ya está registrado" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(password !== undefined && {
          password: await bcrypt.hash(password, 10),
        }),
        ...(docket !== undefined && { docket }),
        ...(role !== undefined && { role }),
      },
      select: userSelect,
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingUser = await prisma.user.findFirst({
      where: { id, active: true },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await prisma.user.update({
      where: { id },
      data: { active: false },
    });

    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};
