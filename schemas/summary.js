import { z } from "zod";

export const createSummarySchema = z.object({
  title: z
    .string({
      required_error: "El título es obligatorio",
      invalid_type_error: "El título debe ser un texto",
    })
    .trim()
    .min(1, "El título es obligatorio")
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(100, "El título no puede superar los 100 caracteres"),
  content: z
    .string({
      required_error: "El contenido es obligatorio",
      invalid_type_error: "El contenido debe ser un texto",
    })
    .trim()
    .min(1, "El contenido es obligatorio"),
  topicId: z
    .number({
      required_error: "El topicId es obligatorio",
      invalid_type_error: "El topicId debe ser un número",
    })
    .int("El topicId debe ser un número entero")
    .positive("El topicId debe ser un número positivo"),
});

export const updateSummarySchema = createSummarySchema.partial();
