import prisma from "../lib/prisma.js";

const subscriptionInclude = {
  course: true,
  student: {
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
      docket: true,
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
    const { status, courseId, studentId } = req.body;

    const courseExists = await prisma.course.findFirst({
      where: { id: courseId, active: true },
    });

    if (!courseExists) {
      return res.status(404).json({
        message: "El curso especificado no existe o no está activo",
      });
    }

    const studentExists = await prisma.user.findFirst({
      where: { id: studentId, role: "STUDENT", active: true },
    });

    if (!studentExists) {
      return res.status(404).json({
        message: "El alumno especificado no existe o no está activo",
      });
    }

    const newSubscription = await prisma.courseSubscription.create({
      data: {
        status,
        courseId,
        studentId,
      },
      include: subscriptionInclude,
    });

    return res.status(201).json(newSubscription);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "El alumno ya está inscripto en este curso" });
    }

    console.error("Error creating course subscription:", error);
    return res.status(500).json({ message: "Error al crear la inscripción" });
  }
};

export const updateCourseSubscription = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, courseId, studentId } = req.body;

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

    if (studentId !== undefined) {
      const studentExists = await prisma.user.findFirst({
        where: { id: studentId, role: "STUDENT", active: true },
      });

      if (!studentExists) {
        return res.status(404).json({
          message: "El alumno especificado no existe o no está activo",
        });
      }
    }

    const updatedSubscription = await prisma.courseSubscription.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(courseId !== undefined && { courseId }),
        ...(studentId !== undefined && { studentId }),
      },
      include: subscriptionInclude,
    });

    return res.status(200).json(updatedSubscription);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "El alumno ya está inscripto en este curso" });
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
