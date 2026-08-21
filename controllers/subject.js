import prisma from "../lib/prisma.js";

export const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { active: true },
    });

    return res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return res.status(500).json({ message: "Error al obtener las materias" });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const subject = await prisma.subject.findUnique({
      where: { id, active: true },
    });

    if (!subject) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    return res.status(200).json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    return res.status(500).json({ message: "Error al obtener la materia" });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const newSubject = await prisma.subject.create({
      data: {
        name,
        description,
      },
    });

    return res.status(201).json(newSubject);
  } catch (error) {
    console.error("Error creating subject:", error);
    return res.status(500).json({ message: "Error al crear la materia" });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    const existingSubject = await prisma.subject.findUnique({
      where: { id, active: true },
    });

    if (!existingSubject) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    const updatedSubject = await prisma.subject.update({
      where: { id, active: true },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return res.status(200).json(updatedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
    return res.status(500).json({ message: "Error al actualizar la materia" });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    await prisma.subject.update({
      where: { id },
      data: { active: false },
    });

    return res.status(200).json({ message: "Materia eliminada exitosamente" });
  } catch (error) {
    console.error("Error deleting subject:", error);

    return res.status(500).json({ message: "Error al eliminar la materia" });
  }
};
