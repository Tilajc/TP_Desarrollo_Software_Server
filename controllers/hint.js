import prisma from "../lib/prisma.js";
import { accessibleContentWhere, canManage } from "../lib/access.js";

const hintInclude = {
  card: { include: { topic: true } },
};

const forbidden = (res) =>
  res
    .status(403)
    .json({ message: "No tenés permisos para realizar esta acción" });

export const getHints = async (req, res) => {
  const { cardId } = req.query;

  try {
    const hints = await prisma.hint.findMany({
      where: {
        active: true,
        card: await accessibleContentWhere(req.user),
        ...(cardId && { cardId: Number(cardId) }),
      },
      include: hintInclude,
    });

    return res.status(200).json(hints);
  } catch (error) {
    console.error("Error fetching hints:", error);
    return res.status(500).json({ message: "Error al obtener las pistas" });
  }
};

export const getHintById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const hint = await prisma.hint.findFirst({
      where: {
        id,
        active: true,
        card: await accessibleContentWhere(req.user),
      },
    });

    if (!hint) {
      return res.status(404).json({ message: "Pista no encontrada" });
    }

    return res.status(200).json(hint);
  } catch (error) {
    console.error("Error fetching hint:", error);
    return res.status(500).json({ message: "Error al obtener la pista" });
  }
};

export const createHint = async (req, res) => {
  try {
    const { content, cardId } = req.body;

    const cardExists = await prisma.card.findFirst({
      where: { id: cardId, active: true },
    });

    if (!cardExists) {
      return res.status(404).json({
        message: "La tarjeta especificada no existe o no está activa",
      });
    }

    if (!canManage(req.user, cardExists.authorId)) {
      return forbidden(res);
    }

    const newHint = await prisma.hint.create({
      data: {
        content,
        cardId,
      },
    });

    return res.status(201).json(newHint);
  } catch (error) {
    console.error("Error creating hint:", error);
    return res.status(500).json({ message: "Error al crear la pista" });
  }
};

export const updateHint = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { content, cardId } = req.body;

    const existingHint = await prisma.hint.findFirst({
      where: { id, active: true },
      include: { card: { select: { authorId: true } } },
    });

    if (!existingHint) {
      return res.status(404).json({ message: "Pista no encontrada" });
    }

    if (!canManage(req.user, existingHint.card.authorId)) {
      return forbidden(res);
    }

    if (cardId !== undefined) {
      const cardExists = await prisma.card.findFirst({
        where: { id: cardId, active: true },
      });

      if (!cardExists) {
        return res.status(404).json({
          message: "La tarjeta especificada no existe o no está activa",
        });
      }

      if (!canManage(req.user, cardExists.authorId)) {
        return forbidden(res);
      }
    }

    const updatedHint = await prisma.hint.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(cardId !== undefined && { cardId }),
      },
    });

    return res.status(200).json(updatedHint);
  } catch (error) {
    console.error("Error updating hint:", error);
    return res.status(500).json({ message: "Error al actualizar la pista" });
  }
};

export const deleteHint = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingHint = await prisma.hint.findFirst({
      where: { id, active: true },
      include: { card: { select: { authorId: true } } },
    });

    if (!existingHint) {
      return res.status(404).json({ message: "Pista no encontrada" });
    }

    if (!canManage(req.user, existingHint.card.authorId)) {
      return forbidden(res);
    }

    await prisma.hint.update({
      where: { id },
      data: { active: false },
    });

    return res.status(200).json({ message: "Pista eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting hint:", error);
    return res.status(500).json({ message: "Error al eliminar la pista" });
  }
};
