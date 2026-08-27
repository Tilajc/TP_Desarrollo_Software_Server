import { z } from "zod";

export const createClassSchema = z.object({
  year: z
    .number({
      invalid_type_error: "El año debe ser un número",
    })
    .int("El año debe ser un entero")
    .min(1900, "El año debe ser mayor o igual a 1900")
    .max(2100, "El año debe ser menor o igual a 2100")
    .optional()
    .nullable(),
  teacherId: z
    .number({
      required_error: "El teacherId es obligatorio",
      invalid_type_error: "El teacherId debe ser un número",
    })
    .int("El teacherId debe ser un número entero")
    .positive("El teacherId debe ser mayor a 0"),
  subjectId: z
    .number({
      required_error: "El subjectId es obligatorio",
      invalid_type_error: "El subjectId debe ser un número",
    })
    .int("El subjectId debe ser un número entero")
    .positive("El subjectId debe ser mayor a 0"),
});

export const updateClassSchema = createClassSchema.partial();
