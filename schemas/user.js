import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string({
      required_error: "El nombre es obligatorio",
      invalid_type_error: "El nombre debe ser un texto",
    })
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres"),

  lastName: z
    .string({
      required_error: "El apellido es obligatorio",
      invalid_type_error: "El apellido debe ser un texto",
    })
    .trim()
    .min(1, "El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede superar los 50 caracteres"),

  email: z
    .string({
      required_error: "El email es obligatorio",
      invalid_type_error: "El email debe ser un texto",
    })
    .trim()
    .email("El formato de email no es válido"),

  password: z
    .string({
      required_error: "La contraseña es obligatoria",
      invalid_type_error: "La contraseña debe ser un texto",
    })
    .min(6, "La contraseña debe tener al menos 6 caracteres"),

  docket: z
    .string({
      invalid_type_error: "El legajo debe ser un texto",
    })
    .trim()
    .optional()
    .nullable(),

  role: z.enum(["ADMIN", "TEACHER", "STUDENT"], {
    errorMap: () => ({
      message: "El rol debe ser ADMIN, TEACHER o STUDENT",
    }),
  }),
});

export const updateUserSchema = createUserSchema.partial();
