import prisma from "../lib/prisma.js";

export const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany();

    return res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return res.status(500).json({ message: "Failed to fetch subjects" });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const subject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.status(200).json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    return res.status(500).json({ message: "Failed to fetch subject" });
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
    return res.status(500).json({ message: "Failed to create subject" });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return res.status(200).json(updatedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
    return res.status(500).json({ message: "Failed to update subject" });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await prisma.subject.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    if (error.code === "P2003") {
      return res.status(400).json({
        message:
          "Cannot delete subject because it is referenced by other entities.",
      });
    }

    return res.status(500).json({ message: "Failed to delete subject" });
  }
};
