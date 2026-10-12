import prisma from "../lib/prisma.js";

export const getTopics = async (req, res) => {
  try {
    const { subjectId } = req.query;

    const topics = await prisma.topic.findMany({
      where: {
        active: true,
        ...(subjectId && { subjectId: Number(subjectId) }),
      },
      include: { subject: true },
    });

    return res.status(200).json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return res.status(500).json({ message: "Error al obtener los temas" });
  }
};

export const getTopicById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const topic = await prisma.topic.findFirst({
      where: { id, active: true },
      include: { subject: true },
    });

    if (!topic) {
      return res.status(404).json({ message: "Tema no encontrado" });
    }

    return res.status(200).json(topic);
  } catch (error) {
    console.error("Error fetching topic:", error);
    return res.status(500).json({ message: "Error al obtener el tema" });
  }
};

export const createTopic = async (req, res) => {
  try {
    const { name, subjectId } = req.body;

    const subjectExists = await prisma.subject.findFirst({
      where: { id: subjectId, active: true },
    });

    if (!subjectExists) {
      return res.status(404).json({
        message: "La materia especificada no existe o no está activa",
      });
    }

    const newTopic = await prisma.topic.create({
      data: {
        name,
        subjectId,
      },
      include: { subject: true },
    });

    return res.status(201).json(newTopic);
  } catch (error) {
    console.error("Error creating topic:", error);
    return res.status(500).json({ message: "Error al crear el tema" });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, subjectId } = req.body;

    const existingTopic = await prisma.topic.findFirst({
      where: { id, active: true },
    });

    if (!existingTopic) {
      return res.status(404).json({ message: "Tema no encontrado" });
    }

    if (subjectId !== undefined) {
      const subjectExists = await prisma.subject.findFirst({
        where: { id: subjectId, active: true },
      });

      if (!subjectExists) {
        return res.status(404).json({
          message: "La materia especificada no existe o no está activa",
        });
      }
    }

    const updatedTopic = await prisma.topic.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(subjectId !== undefined && { subjectId }),
      },
      include: { subject: true },
    });

    return res.status(200).json(updatedTopic);
  } catch (error) {
    console.error("Error updating topic:", error);
    return res.status(500).json({ message: "Error al actualizar el tema" });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingTopic = await prisma.topic.findFirst({
      where: { id, active: true },
    });

    if (!existingTopic) {
      return res.status(404).json({ message: "Tema no encontrado" });
    }

    await prisma.topic.update({
      where: { id },
      data: { active: false },
    });

    return res.status(200).json({ message: "Tema eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return res.status(500).json({ message: "Error al eliminar el tema" });
  }
};
