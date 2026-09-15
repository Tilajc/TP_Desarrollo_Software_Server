import prisma from "../lib/prisma.js";

export const getClassSubscriptions = async (req, res) => {
  try {
    const subscriptions = await prisma.classSubscription.findMany({
      where: { active: true },
      include: {
        class: true,
        student: true,
      },
    });
    return res.status(200).json(subscriptions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getClassSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await prisma.classSubscription.findUnique({
      where: { id: Number(id) },
      include: {
        class: true,
        student: true,
      },
    });

    if (!subscription || !subscription.active) {
      return res.status(404).json({ message: "Inscripción no encontrada" });
    }

    return res.status(200).json(subscription);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createClassSubscription = async (req, res) => {
  try {
    const newSubscription = await prisma.classSubscription.create({
      data: req.body,
    });
    return res.status(201).json(newSubscription);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateClassSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSubscription = await prisma.classSubscription.update({
      where: { id: Number(id) },
      data: req.body,
    });
    return res.status(200).json(updatedSubscription);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteClassSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.classSubscription.update({
      where: { id: Number(id) },
      data: { active: false },
    });
    return res
      .status(200)
      .json({ message: "Inscripción dada de baja correctamente" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
