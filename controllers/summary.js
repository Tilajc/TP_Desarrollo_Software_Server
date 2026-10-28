import * as summaryService from "../services/summary.js";

export const getSummaries = async (req, res) => {
  try {
    const summaries = await summaryService.getSummariesService(
      req.user,
      req.query,
    );
    return res.status(200).json(summaries);
  } catch (error) {
    console.error("Error fetching summaries:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener los resúmenes",
    });
  }
};

export const getSummaryById = async (req, res) => {
  try {
    const summary = await summaryService.getSummaryByIdService(
      req.user,
      req.params.id,
    );

    if (!summary) {
      return res.status(404).json({ message: "Resumen no encontrado" });
    }

    return res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener el resumen",
    });
  }
};

export const createSummary = async (req, res) => {
  try {
    const newSummary = await summaryService.createSummaryService(
      req.user,
      req.body,
    );
    return res.status(201).json(newSummary);
  } catch (error) {
    console.error("Error creating summary:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al crear el resumen",
    });
  }
};

export const updateSummary = async (req, res) => {
  try {
    const updatedSummary = await summaryService.updateSummaryService(
      req.user,
      req.params.id,
      req.body,
    );
    return res.status(200).json(updatedSummary);
  } catch (error) {
    console.error("Error updating summary:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al actualizar el resumen",
    });
  }
};

export const deleteSummary = async (req, res) => {
  try {
    const result = await summaryService.deleteSummaryService(
      req.user,
      req.params.id,
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting summary:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al eliminar el resumen",
    });
  }
};
