import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z
    .string({
      required_error: "El nombre es obligatorio",
      invalid_type_error: "El nombre debe ser un texto",
    })
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres"),
  description: z
    .string({
      invalid_type_error: "La descripción debe ser un texto",
    })
    .trim()
    .max(300, "La descripción no puede superar los 300 caracteres")
    .optional()
    .nullable(),
});

export const updateSubjectSchema = createSubjectSchema.partial();
