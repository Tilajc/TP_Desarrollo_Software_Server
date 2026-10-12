import prisma from "../lib/prisma.js";

const subscriptionInclude = {
  class: true,
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

export const getClassSubscriptions = async (req, res) => {
  try {
    const subscriptions = await prisma.classSubscription.findMany({
      where: { active: true },
      include: subscriptionInclude,
    });

    return res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching class subscriptions:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener las inscripciones" });
  }
};

export const getClassSubscriptionById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const subscription = await prisma.classSubscription.findFirst({
      where: { id, active: true },
      include: subscriptionInclude,
    });

    if (!subscription) {
      return res.status(404).json({ message: "Inscripción no encontrada" });
    }

    return res.status(200).json(subscription);
  } catch (error) {
    console.error("Error fetching class subscription:", error);
    return res.status(500).json({ message: "Error al obtener la inscripción" });
  }
};

export const createClassSubscription = async (req, res) => {
  try {
    const { status, classId, studentId } = req.body;

    const classExists = await prisma.class.findFirst({
      where: { id: classId, active: true },
    });

    if (!classExists) {
      return res.status(404).json({
        message: "La clase especificada no existe o no está activa",
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

    const newSubscription = await prisma.classSubscription.create({
      data: {
        status,
        classId,
        studentId,
      },
      include: subscriptionInclude,
    });

    return res.status(201).json(newSubscription);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "El alumno ya está inscripto en esa clase" });
    }

    console.error("Error creating class subscription:", error);
    return res.status(500).json({ message: "Error al crear la inscripción" });
  }
};

export const updateClassSubscription = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, classId, studentId } = req.body;

    const existingSubscription = await prisma.classSubscription.findFirst({
      where: { id, active: true },
    });

    if (!existingSubscription) {
      return res.status(404).json({ message: "Inscripción no encontrada" });
    }

    if (classId !== undefined) {
      const classExists = await prisma.class.findFirst({
        where: { id: classId, active: true },
      });

      if (!classExists) {
        return res.status(404).json({
          message: "La clase especificada no existe o no está activa",
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

    const updatedSubscription = await prisma.classSubscription.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(classId !== undefined && { classId }),
        ...(studentId !== undefined && { studentId }),
      },
      include: subscriptionInclude,
    });

    return res.status(200).json(updatedSubscription);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "El alumno ya está inscripto en esa clase" });
    }

    console.error("Error updating class subscription:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la inscripción" });
  }
};

export const deleteClassSubscription = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingSubscription = await prisma.classSubscription.findFirst({
      where: { id, active: true },
    });

    if (!existingSubscription) {
      return res.status(404).json({ message: "Inscripción no encontrada" });
    }

    await prisma.classSubscription.update({
      where: { id },
      data: { active: false },
    });

    return res
      .status(200)
      .json({ message: "Inscripción eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting class subscription:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la inscripción" });
  }
};
