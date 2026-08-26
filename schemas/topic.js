import { z } from "zod";

export const createTopicSchema = z.object({
  name: z
    .string({
      required_error: "El nombre es obligatorio",
      invalid_type_error: "El nombre debe ser un texto",
    })
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres"),
  subjectId: z
    .number({
      required_error: "El subjectId es obligatorio",
      invalid_type_error: "El subjectId debe ser un número",
    })
    .int("El subjectId debe ser un número entero")
    .positive("El subjectId debe ser positivo"),
});

export const updateTopicSchema = createTopicSchema.partial();
