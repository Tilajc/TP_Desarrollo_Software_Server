import { z } from "zod";

export const createClassSubscriptionSchema = z.object({
  status: z.enum(["CURSANDO", "FINALIZADO", "ABANDONADO"], {
    errorMap: () => ({
      message: "El estado debe ser CURSANDO, FINALIZADO o ABANDONADO",
    }),
  }),
  classId: z
    .number({
      required_error: "El classId es obligatorio",
      invalid_type_error: "El classId debe ser un número",
    })
    .int("El classId debe ser un número entero")
    .positive("El classId debe ser un número positivo"),
  studentId: z
    .number({
      required_error: "El studentId es obligatorio",
      invalid_type_error: "El studentId debe ser un número",
    })
    .int("El studentId debe ser un número entero")
    .positive("El studentId debe ser un número positivo"),
});

export const updateClassSubscriptionSchema =
  createClassSubscriptionSchema.partial();
