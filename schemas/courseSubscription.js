import { z } from "zod";

export const createCourseSubscriptionSchema = z.object({
  status: z.enum(["CURSANDO", "FINALIZADO", "ABANDONADO"], {
    errorMap: () => ({
      message: "El estado debe ser CURSANDO, FINALIZADO o ABANDONADO",
    }),
  }),
  courseId: z.coerce
    .number({
      required_error: "El courseId es obligatorio",
      invalid_type_error: "El courseId debe ser un número",
    })
    .int("El courseId debe ser un número entero")
    .positive("El courseId debe ser un número positivo"),
  studentId: z.coerce
    .number({
      required_error: "El studentId es obligatorio",
      invalid_type_error: "El studentId debe ser un número",
    })
    .int("El studentId debe ser un número entero")
    .positive("El studentId debe ser un número positivo"),
});

export const updateCourseSubscriptionSchema =
  createCourseSubscriptionSchema.partial();
