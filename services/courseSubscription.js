import prisma from "../lib/prisma.js";
import { authorSelect, canManage, isAdmin } from "../lib/access.js";

const subscriptionInclude = {
  course: {
    include: {
      author: { select: authorSelect },
      subject: true,
    },
  },
  subscriber: {
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
    },
  },
};

const visibleTo = (user) => (isAdmin(user) ? {} : { subscriberId: user.id });

const activeCourse = { course: { active: true } };

export const getCourseSubscriptionsService = async (user, { courseId }) => {
  return await prisma.courseSubscription.findMany({
    where: {
      active: true,
      ...activeCourse,
      ...visibleTo(user),
      ...(courseId && { courseId: Number(courseId) }),
    },
    include: subscriptionInclude,
  });
};

export const getCourseSubscriptionByIdService = async (user, id) => {
  return await prisma.courseSubscription.findFirst({
    where: {
      id: Number(id),
      active: true,
      ...activeCourse,
      ...visibleTo(user),
    },
    include: subscriptionInclude,
  });
};

export const createCourseSubscriptionService = async (
  user,
  { courseId, subscriberId: inputSubscriberId },
) => {
  const subscriberId = inputSubscriberId ?? user.id;

  if (subscriberId !== user.id && !isAdmin(user)) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  const courseExists = await prisma.course.findFirst({
    where: { id: courseId, active: true },
  });

  if (!courseExists) {
    const error = new Error("El curso especificado no existe o no está activo");
    error.status = 404;
    throw error;
  }

  const subscriberExists = await prisma.user.findFirst({
    where: { id: subscriberId, active: true },
  });

  if (!subscriberExists) {
    const error = new Error(
      "El usuario especificado no existe o no está activo",
    );
    error.status = 404;
    throw error;
  }

  if (courseExists.authorId === subscriberId) {
    const error = new Error("No podés inscribirte a tu propio curso");
    error.status = 400;
    throw error;
  }

  const previousSubscription = await prisma.courseSubscription.findUnique({
    where: { subscriberId_courseId: { subscriberId, courseId } },
  });

  if (previousSubscription?.active) {
    const error = new Error("El usuario ya está inscripto en este curso");
    error.status = 409;
    throw error;
  }

  return previousSubscription
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
};

export const updateCourseSubscriptionService = async (
  user,
  id,
  { courseId, subscriberId },
) => {
  const parsedId = Number(id);

  const existingSubscription = await prisma.courseSubscription.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingSubscription) {
    const error = new Error("Inscripción no encontrada");
    error.status = 404;
    throw error;
  }

  if (!canManage(user, existingSubscription.subscriberId)) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  if (
    subscriberId !== undefined &&
    subscriberId !== existingSubscription.subscriberId &&
    !isAdmin(user)
  ) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  if (courseId !== undefined) {
    const courseExists = await prisma.course.findFirst({
      where: { id: courseId, active: true },
    });

    if (!courseExists) {
      const error = new Error(
        "El curso especificado no existe o no está activo",
      );
      error.status = 404;
      throw error;
    }
  }

  if (subscriberId !== undefined) {
    const subscriberExists = await prisma.user.findFirst({
      where: { id: subscriberId, active: true },
    });

    if (!subscriberExists) {
      const error = new Error(
        "El usuario especificado no existe o no está activo",
      );
      error.status = 404;
      throw error;
    }
  }

  const targetCourse = await prisma.course.findFirst({
    where: { id: courseId ?? existingSubscription.courseId, active: true },
  });

  if (!targetCourse) {
    const error = new Error("El curso especificado no existe o no está activo");
    error.status = 404;
    throw error;
  }

  const targetSubscriberId = subscriberId ?? existingSubscription.subscriberId;

  if (targetCourse.authorId === targetSubscriberId) {
    const error = new Error("No podés inscribirte a tu propio curso");
    error.status = 400;
    throw error;
  }

  return await prisma.courseSubscription.update({
    where: { id: parsedId },
    data: {
      ...(courseId !== undefined && { courseId }),
      ...(subscriberId !== undefined && { subscriberId }),
    },
    include: subscriptionInclude,
  });
};

export const deleteCourseSubscriptionService = async (user, id) => {
  const parsedId = Number(id);

  const existingSubscription = await prisma.courseSubscription.findFirst({
    where: { id: parsedId, active: true },
  });

  if (!existingSubscription) {
    const error = new Error("Inscripción no encontrada");
    error.status = 404;
    throw error;
  }

  if (!canManage(user, existingSubscription.subscriberId)) {
    const error = new Error("No tenés permisos para realizar esta acción");
    error.status = 403;
    throw error;
  }

  await prisma.courseSubscription.update({
    where: { id: parsedId },
    data: { active: false },
  });

  return { message: "Inscripción eliminada correctamente" };
};
