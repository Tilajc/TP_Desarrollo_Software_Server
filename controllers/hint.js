import * as hintService from "../services/hint.js"; // o "../services/hint.service.js" según tu preferencia

export const getHints = async (req, res) => {
  try {
    const hints = await hintService.getHintsService(req.user, req.query.cardId);
    return res.status(200).json(hints);
  } catch (error) {
    console.error("Error fetching hints:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener las pistas",
    });
  }
};

export const getHintById = async (req, res) => {
  try {
    const hint = await hintService.getHintByIdService(req.user, req.params.id);

    if (!hint) {
      return res.status(404).json({ message: "Pista no encontrada" });
    }

    return res.status(200).json(hint);
  } catch (error) {
    console.error("Error fetching hint:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener la pista",
    });
  }
};

export const createHint = async (req, res) => {
  try {
    const newHint = await hintService.createHintService(req.user, req.body);
    return res.status(201).json(newHint);
  } catch (error) {
    console.error("Error creating hint:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al crear la pista",
    });
  }
};

export const updateHint = async (req, res) => {
  try {
    const updatedHint = await hintService.updateHintService(
      req.user,
      req.params.id,
      req.body,
    );
    return res.status(200).json(updatedHint);
  } catch (error) {
    console.error("Error updating hint:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al actualizar la pista",
    });
  }
};

export const deleteHint = async (req, res) => {
  try {
    const result = await hintService.deleteHintService(req.user, req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting hint:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al eliminar la pista",
    });
  }
};
