import prisma from "../lib/prisma.js";

export const getSummaries = async (req, res) => {
  try {
    const summaries = await prisma.summary.findMany({
      where: { active: true },
    });

    return res.status(200).json(summaries);
  } catch (error) {
    console.error("Error fetching summaries:", error);
    return res.status(500).json({ message: "Error al obtener los resúmenes" });
  }
};

export const getSummaryById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const summary = await prisma.summary.findFirst({
      where: { id, active: true },
    });

    if (!summary) {
      return res.status(404).json({ message: "Resumen no encontrado" });
    }

    return res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({ message: "Error al obtener el resumen" });
  }
};

export const createSummary = async (req, res) => {
  try {
    const { title, content, topicId } = req.body;

    const topicExists = await prisma.topic.findFirst({
      where: { id: topicId, active: true },
    });

    if (!topicExists) {
      return res.status(404).json({
        message: "El tema especificado no existe o no está activo",
      });
    }

    const newSummary = await prisma.summary.create({
      data: {
        title,
        content,
        topicId,
      },
    });

    return res.status(201).json(newSummary);
  } catch (error) {
    console.error("Error creating summary:", error);
    return res.status(500).json({ message: "Error al crear el resumen" });
  }
};

export const updateSummary = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content, topicId } = req.body;

    const existingSummary = await prisma.summary.findFirst({
      where: { id, active: true },
    });

    if (!existingSummary) {
      return res.status(404).json({ message: "Resumen no encontrado" });
    }

    if (topicId !== undefined) {
      const topicExists = await prisma.topic.findFirst({
        where: { id: topicId, active: true },
      });

      if (!topicExists) {
        return res.status(404).json({
          message: "El tema especificado no existe o no está activo",
        });
      }
    }

    const updatedSummary = await prisma.summary.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(topicId !== undefined && { topicId }),
      },
    });

    return res.status(200).json(updatedSummary);
  } catch (error) {
    console.error("Error updating summary:", error);
    return res.status(500).json({ message: "Error al actualizar el resumen" });
  }
};

export const deleteSummary = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingSummary = await prisma.summary.findFirst({
      where: { id, active: true },
    });

    if (!existingSummary) {
      return res.status(404).json({ message: "Resumen no encontrado" });
    }

    await prisma.summary.update({
      where: { id },
      data: { active: false },
    });

    return res.status(200).json({ message: "Resumen eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting summary:", error);
    return res.status(500).json({ message: "Error al eliminar el resumen" });
  }
};
