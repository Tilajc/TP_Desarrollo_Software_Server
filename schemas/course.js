import { z } from "zod";

export const createCourseSchema = z.object({
  authorId: z.coerce
    .number({
      invalid_type_error: "El authorId debe ser un número",
    })
    .int("El authorId debe ser un número entero")
    .positive("El authorId debe ser mayor a 0")
    .optional(),
  subjectId: z.coerce
    .number({
      required_error: "El subjectId es obligatorio",
      invalid_type_error: "El subjectId debe ser un número",
    })
    .int("El subjectId debe ser un número entero")
    .positive("El subjectId debe ser mayor a 0"),
});

export const updateCourseSchema = createCourseSchema.partial();
