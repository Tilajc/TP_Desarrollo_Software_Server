import * as courseSubscriptionService from "../services/courseSubscription.js";

export const getCourseSubscriptions = async (req, res) => {
  try {
    const subscriptions =
      await courseSubscriptionService.getCourseSubscriptionsService(
        req.user,
        req.query,
      );
    return res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching course subscriptions:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Error al obtener las inscripciones" });
  }
};

export const getCourseSubscriptionById = async (req, res) => {
  try {
    const subscription =
      await courseSubscriptionService.getCourseSubscriptionByIdService(
        req.user,
        req.params.id,
      );

    if (!subscription) {
      return res.status(404).json({ message: "Inscripción no encontrada" });
    }

    return res.status(200).json(subscription);
  } catch (error) {
    console.error("Error fetching course subscription:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Error al obtener la inscripción" });
  }
};

export const createCourseSubscription = async (req, res) => {
  try {
    const newSubscription =
      await courseSubscriptionService.createCourseSubscriptionService(
        req.user,
        req.body,
      );
    return res.status(201).json(newSubscription);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "El usuario ya está inscripto en este curso" });
    }

    console.error("Error creating course subscription:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Error al crear la inscripción" });
  }
};

export const updateCourseSubscription = async (req, res) => {
  try {
    const updatedSubscription =
      await courseSubscriptionService.updateCourseSubscriptionService(
        req.user,
        req.params.id,
        req.body,
      );
    return res.status(200).json(updatedSubscription);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "El usuario ya está inscripto en este curso" });
    }

    console.error("Error updating course subscription:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Error al actualizar la inscripción" });
  }
};

export const deleteCourseSubscription = async (req, res) => {
  try {
    const result =
      await courseSubscriptionService.deleteCourseSubscriptionService(
        req.user,
        req.params.id,
      );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting course subscription:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Error al eliminar la inscripción" });
  }
};
