import prisma from "../lib/prisma.js";
import { canManage, isAdmin } from "../lib/access.js";

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

const forbidden = (res) =>
  res
    .status(403)
    .json({ message: "No tenés permisos para realizar esta acción" });

const visibleTo = (user) => (isAdmin(user) ? {} : { subscriberId: user.id });

export const getCourseSubscriptions = async (req, res) => {
  try {
    const { courseId } = req.query;

    const subscriptions = await prisma.courseSubscription.findMany({
      where: {
        active: true,
        ...visibleTo(req.user),
        ...(courseId && { courseId: Number(courseId) }),
      },
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
      where: { id, active: true, ...visibleTo(req.user) },
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

    if (subscriberId !== req.user.id && !isAdmin(req.user)) {
      return forbidden(res);
    }

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

    if (courseExists.authorId === subscriberId) {
      return res
        .status(400)
        .json({ message: "No podés inscribirte a tu propio curso" });
    }

    const previousSubscription = await prisma.courseSubscription.findUnique({
      where: { subscriberId_courseId: { subscriberId, courseId } },
    });

    if (previousSubscription?.active) {
      return res
        .status(409)
        .json({ message: "El usuario ya está inscripto en este curso" });
    }

    const newSubscription = previousSubscription
      ? await prisma.courseSubscription.update({
          where: { id: previousSubscription.id },
          data: { active: true },
          include: subscriptionInclude,
        })
      : await prisma.courseSubscription.create({
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

    if (!canManage(req.user, existingSubscription.subscriberId)) {
      return forbidden(res);
    }

    if (
      subscriberId !== undefined &&
      subscriberId !== existingSubscription.subscriberId &&
      !isAdmin(req.user)
    ) {
      return forbidden(res);
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

    const targetCourse = await prisma.course.findFirst({
      where: { id: courseId ?? existingSubscription.courseId, active: true },
    });

    if (!targetCourse) {
      return res.status(404).json({
        message: "El curso especificado no existe o no está activo",
      });
    }

    const targetSubscriberId =
      subscriberId ?? existingSubscription.subscriberId;

    if (targetCourse.authorId === targetSubscriberId) {
      return res
        .status(400)
        .json({ message: "No podés inscribirte a tu propio curso" });
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

    if (!canManage(req.user, existingSubscription.subscriberId)) {
      return forbidden(res);
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
