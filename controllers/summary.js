import prisma from "../lib/prisma.js";
import {
  accessibleContentWhere,
  authorSelect,
  canManage,
  hasCourse,
} from "../lib/access.js";

const summaryInclude = {
  topic: { include: { subject: true } },
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

export const getSummaries = async (req, res) => {
  try {
    const { topicId, authorId, subjectId } = req.query;

    const summaries = await prisma.summary.findMany({
      where: {
        active: true,
        ...(await accessibleContentWhere(req.user)),
        ...(topicId && { topicId: Number(topicId) }),
        ...(authorId && { authorId: Number(authorId) }),
        ...(subjectId && { topic: { subjectId: Number(subjectId) } }),
      },
      include: summaryInclude,
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
      where: {
        id,
        active: true,
        ...(await accessibleContentWhere(req.user)),
      },
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

    if (!(await hasCourse(req.user.id, topicExists.subjectId))) {
      return noCourse(res);
    }

    const newSummary = await prisma.summary.create({
      data: {
        title,
        content,
        topicId,
        authorId: req.user.id,
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

    if (!canManage(req.user, existingSummary.authorId)) {
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
        topicId !== existingSummary.topicId &&
        !(await hasCourse(existingSummary.authorId, topicExists.subjectId))
      ) {
        return noCourse(res);
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

    if (!canManage(req.user, existingSummary.authorId)) {
      return forbidden(res);
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
