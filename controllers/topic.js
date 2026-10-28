import * as topicService from "../services/topic.js";

export const getTopics = async (req, res) => {
  try {
    const topics = await topicService.getTopicsService(req.query);
    return res.status(200).json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener los temas",
    });
  }
};

export const getTopicById = async (req, res) => {
  try {
    const topic = await topicService.getTopicByIdService(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Tema no encontrado" });
    }

    return res.status(200).json(topic);
  } catch (error) {
    console.error("Error fetching topic:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener el tema",
    });
  }
};

export const createTopic = async (req, res) => {
  try {
    const newTopic = await topicService.createTopicService(req.body);
    return res.status(201).json(newTopic);
  } catch (error) {
    console.error("Error creating topic:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al crear el tema",
    });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const updatedTopic = await topicService.updateTopicService(
      req.params.id,
      req.body,
    );
    return res.status(200).json(updatedTopic);
  } catch (error) {
    console.error("Error updating topic:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al actualizar el tema",
    });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const result = await topicService.deleteTopicService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting topic:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al eliminar el tema",
    });
  }
};
