import { z } from "zod";

export const createCardSchema = z.object({
  question: z
    .string({
      required_error: "La pregunta es obligatoria",
      invalid_type_error: "La pregunta debe ser un texto",
    })
    .trim()
    .min(1, "La pregunta es obligatoria")
    .min(3, "La pregunta debe tener al menos 3 caracteres"),
  answer: z
    .string({
      required_error: "La respuesta es obligatoria",
      invalid_type_error: "La respuesta debe ser un texto",
    })
    .trim()
    .min(1, "La respuesta es obligatoria"),
  topicId: z
    .number({
      required_error: "El topicId es obligatorio",
      invalid_type_error: "El topicId debe ser un número",
    })
    .int("El topicId debe ser un número entero")
    .positive("El topicId debe ser un número positivo"),
});

export const updateCardSchema = createCardSchema.partial();
