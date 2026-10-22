import prisma from "../lib/prisma.js";

const subscriptionInclude = {
  course: true,
  subscriber: {
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
    },
  },
};

export const getCourseSubscriptions = async (req, res) => {
  try {
    const subscriptions = await prisma.courseSubscription.findMany({
      where: { active: true },
      include: subscriptionInclude,
    });

    return res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching course subscriptions:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener las inscripciones" });
  }
};

export const getCourseSubscriptionById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const subscription = await prisma.courseSubscription.findFirst({
      where: { id, active: true },
      include: subscriptionInclude,
    });

    if (!subscription) {
      return res.status(404).json({ message: "Inscripción no encontrada" });
    }

    return res.status(200).json(subscription);
  } catch (error) {
    console.error("Error fetching course subscription:", error);
    return res.status(500).json({ message: "Error al obtener la inscripción" });
  }
};

export const createCourseSubscription = async (req, res) => {
  try {
    const { courseId } = req.body;
    const subscriberId = req.body.subscriberId ?? req.user.id;

    const courseExists = await prisma.course.findFirst({
      where: { id: courseId, active: true },
    });

    if (!courseExists) {
      return res.status(404).json({
        message: "El curso especificado no existe o no está activo",
      });
    }

    const subscriberExists = await prisma.user.findFirst({
      where: { id: subscriberId, active: true },
    });

    if (!subscriberExists) {
      return res.status(404).json({
        message: "El usuario especificado no existe o no está activo",
      });
    }

    const newSubscription = await prisma.courseSubscription.create({
      data: {
        courseId,
        subscriberId,
      },
      include: subscriptionInclude,
    });

    return res.status(201).json(newSubscription);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "El usuario ya está inscripto en este curso" });
    }

    console.error("Error creating course subscription:", error);
    return res.status(500).json({ message: "Error al crear la inscripción" });
  }
};

export const updateCourseSubscription = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { courseId, subscriberId } = req.body;

    const existingSubscription = await prisma.courseSubscription.findFirst({
      where: { id, active: true },
    });

    if (!existingSubscription) {
      return res.status(404).json({ message: "Inscripción no encontrada" });
    }

    if (courseId !== undefined) {
      const courseExists = await prisma.course.findFirst({
        where: { id: courseId, active: true },
      });

      if (!courseExists) {
        return res.status(404).json({
          message: "El curso especificado no existe o no está activo",
        });
      }
    }

    if (subscriberId !== undefined) {
      const subscriberExists = await prisma.user.findFirst({
        where: { id: subscriberId, active: true },
      });

      if (!subscriberExists) {
        return res.status(404).json({
          message: "El usuario especificado no existe o no está activo",
        });
      }
    }

    const updatedSubscription = await prisma.courseSubscription.update({
      where: { id },
      data: {
        ...(courseId !== undefined && { courseId }),
        ...(subscriberId !== undefined && { subscriberId }),
      },
      include: subscriptionInclude,
    });

    return res.status(200).json(updatedSubscription);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "El usuario ya está inscripto en este curso" });
    }

    console.error("Error updating course subscription:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la inscripción" });
  }
};

export const deleteCourseSubscription = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingSubscription = await prisma.courseSubscription.findFirst({
      where: { id, active: true },
    });

    if (!existingSubscription) {
      return res.status(404).json({ message: "Inscripción no encontrada" });
    }

    await prisma.courseSubscription.update({
      where: { id },
      data: { active: false },
    });

    return res
      .status(200)
      .json({ message: "Inscripción eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting course subscription:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la inscripción" });
  }
};
