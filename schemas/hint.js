import { z } from "zod";

export const createHintSchema = z.object({
  content: z
    .string({
      required_error: "El contenido es obligatorio",
      invalid_type_error: "El contenido debe ser un texto",
    })
    .trim()
    .min(1, "El contenido es obligatorio")
    .min(3, "El contenido debe tener al menos 3 caracteres"),
  cardId: z
    .number({
      required_error: "El cardId es obligatorio",
      invalid_type_error: "El cardId debe ser un número",
    })
    .int("El cardId debe ser un número entero")
    .positive("El cardId debe ser un número positivo"),
});

export const updateHintSchema = createHintSchema.partial();
