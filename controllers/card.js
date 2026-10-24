import prisma from "../lib/prisma.js";
import {
  accessibleContentWhere,
  authorSelect,
  canManage,
  hasCourse,
} from "../lib/access.js";

const cardInclude = {
  topic: { include: { subject: true } },
  hints: { where: { active: true } },
  author: { select: authorSelect },
};

const forbidden = (res) =>
  res
    .status(403)
    .json({ message: "No tenés permisos para realizar esta acción" });

const noCourse = (res) =>
  res
    .status(403)
    .json({ message: "Primero hay que crear el curso de esta materia" });

export const getCards = async (req, res) => {
  try {
    const { topicId, authorId, subjectId } = req.query;

    const cards = await prisma.card.findMany({
      where: {
        active: true,
        ...(await accessibleContentWhere(req.user)),
        ...(topicId && { topicId: Number(topicId) }),
        ...(authorId && { authorId: Number(authorId) }),
        ...(subjectId && { topic: { subjectId: Number(subjectId) } }),
      },
      include: cardInclude,
    });

    return res.status(200).json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return res.status(500).json({ message: "Error al obtener las tarjetas" });
  }
};

export const getCardById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const card = await prisma.card.findFirst({
      where: {
        id,
        active: true,
        ...(await accessibleContentWhere(req.user)),
      },
      include: cardInclude,
    });

    if (!card) {
      return res.status(404).json({ message: "Tarjeta no encontrada" });
    }

    return res.status(200).json(card);
  } catch (error) {
    console.error("Error fetching card:", error);
    return res.status(500).json({ message: "Error al obtener la tarjeta" });
  }
};

export const createCard = async (req, res) => {
  try {
    const { question, answer, topicId } = req.body;

    const topicExists = await prisma.topic.findFirst({
      where: { id: topicId, active: true },
    });

    if (!topicExists) {
      return res.status(404).json({
        message: "El tema especificado no existe o no está activo",
      });
    }

    if (!(await hasCourse(req.user.id, topicExists.subjectId))) {
      return noCourse(res);
    }

    const newCard = await prisma.card.create({
      data: {
        question,
        answer,
        topicId,
        authorId: req.user.id,
      },
      include: cardInclude,
    });

    return res.status(201).json(newCard);
  } catch (error) {
    console.error("Error creating card:", error);
    return res.status(500).json({ message: "Error al crear la tarjeta" });
  }
};

export const updateCard = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { question, answer, topicId } = req.body;

    const existingCard = await prisma.card.findFirst({
      where: { id, active: true },
    });

    if (!existingCard) {
      return res.status(404).json({ message: "Tarjeta no encontrada" });
    }

    if (!canManage(req.user, existingCard.authorId)) {
      return forbidden(res);
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

      if (
        topicId !== existingCard.topicId &&
        !(await hasCourse(existingCard.authorId, topicExists.subjectId))
      ) {
        return noCourse(res);
      }
    }

    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        ...(question !== undefined && { question }),
        ...(answer !== undefined && { answer }),
        ...(topicId !== undefined && { topicId }),
      },
      include: cardInclude,
    });

    return res.status(200).json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", error);
    return res.status(500).json({ message: "Error al actualizar la tarjeta" });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingCard = await prisma.card.findFirst({
      where: { id, active: true },
    });

    if (!existingCard) {
      return res.status(404).json({ message: "Tarjeta no encontrada" });
    }

    if (!canManage(req.user, existingCard.authorId)) {
      return forbidden(res);
    }

    await prisma.card.update({
      where: { id },
      data: { active: false },
    });

    return res.status(200).json({ message: "Tarjeta eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting card:", error);
    return res.status(500).json({ message: "Error al eliminar la tarjeta" });
  }
};
