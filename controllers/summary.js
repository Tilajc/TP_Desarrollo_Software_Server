import prisma from "../lib/prisma.js";

export const getSummaries = async (req, res) => {
  try {
    const summaries = await prisma.summary.findMany({
      where: { active: true },
    });
    return res.status(200).json(summaries);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSummaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const summary = await prisma.summary.findUnique({
      where: { id: Number(id) },
    });

    if (!summary || !summary.active) {
      return res.status(404).json({ message: "Resumen no encontrado" });
    }

    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createSummary = async (req, res) => {
  try {
    const newSummary = await prisma.summary.create({
      data: req.body,
    });
    return res.status(201).json(newSummary);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSummary = await prisma.summary.update({
      where: { id: Number(id) },
      data: req.body,
    });
    return res.status(200).json(updatedSummary);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSummary = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.summary.update({
      where: { id: Number(id) },
      data: { active: false },
    });
    return res.status(200).json({ message: "Resumen eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
