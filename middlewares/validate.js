import { ZodError } from "zod";

const validate =
  (schema, target = "body") =>
  (req, res, next) => {
    try {
      req[target] = schema.parse(req[target] || {});
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

export default validate;
