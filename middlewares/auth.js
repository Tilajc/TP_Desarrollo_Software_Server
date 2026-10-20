import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const user = await prisma.user.findFirst({
      where: { id: payload.id, active: true },
      select: { id: true, name: true, lastName: true, email: true, role: true },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Usuario no encontrado o dado de baja" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error authenticating:", error);
    return res.status(500).json({ message: "Error de autenticación" });
  }
};

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "No tenés permisos para realizar esta acción" });
    }
    next();
  };
