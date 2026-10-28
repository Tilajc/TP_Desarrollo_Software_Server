import * as cardService from "../services/card.js"; // o "../services/card.service.js"

export const getCards = async (req, res) => {
  try {
    const cards = await cardService.getCardsService(req.user, req.query);
    return res.status(200).json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener las tarjetas",
    });
  }
};

export const getCardById = async (req, res) => {
  try {
    const card = await cardService.getCardByIdService(req.user, req.params.id);

    if (!card) {
      return res.status(404).json({ message: "Tarjeta no encontrada" });
    }

    return res.status(200).json(card);
  } catch (error) {
    console.error("Error fetching card:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener la tarjeta",
    });
  }
};

export const createCard = async (req, res) => {
  try {
    const newCard = await cardService.createCardService(req.user, req.body);
    return res.status(201).json(newCard);
  } catch (error) {
    console.error("Error creating card:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al crear la tarjeta",
    });
  }
};

export const updateCard = async (req, res) => {
  try {
    const updatedCard = await cardService.updateCardService(
      req.user,
      req.params.id,
      req.body,
    );
    return res.status(200).json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al actualizar la tarjeta",
    });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const result = await cardService.deleteCardService(req.user, req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting card:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al eliminar la tarjeta",
    });
  }
};
