import prisma from "../lib/prisma.js";

export const getHints = async (req, res) => {
  try {
    const hints = await prisma.hint.findMany({
      where: { active: true },
    });
    return res.status(200).json(hints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHintById = async (req, res) => {
  try {
    const { id } = req.params;
    const hint = await prisma.hint.findUnique({
      where: { id: Number(id) },
    });

    if (!hint || !hint.active) {
      return res.status(404).json({ message: "Pista no encontrada" });
    }

    return res.status(200).json(hint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createHint = async (req, res) => {
  try {
    const newHint = await prisma.hint.create({
      data: req.body,
    });
    return res.status(201).json(newHint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateHint = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedHint = await prisma.hint.update({
      where: { id: Number(id) },
      data: req.body,
    });
    return res.status(200).json(updatedHint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteHint = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.hint.update({
      where: { id: Number(id) },
      data: { active: false },
    });
    return res.status(200).json({ message: "Pista eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
