import { z } from "zod";

export const createCourseSubscriptionSchema = z.object({
  courseId: z.coerce
    .number({
      required_error: "El courseId es obligatorio",
      invalid_type_error: "El courseId debe ser un número",
    })
    .int("El courseId debe ser un número entero")
    .positive("El courseId debe ser un número positivo"),
  subscriberId: z.coerce
    .number({
      invalid_type_error: "El subscriberId debe ser un número",
    })
    .int("El subscriberId debe ser un número entero")
    .positive("El subscriberId debe ser un número positivo")
    .optional(),
});

export const updateCourseSubscriptionSchema =
  createCourseSubscriptionSchema.partial();
