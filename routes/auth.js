import { Router } from "express";
import { login, getMe, updateProfile } from "../controllers/auth.js";
import { loginSchema } from "../schemas/auth.js";
import { updateUserSchema } from "../schemas/user.js";
import validate from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/login", validate(loginSchema, "body"), login);
router.get("/me", authenticate, getMe);
router.put(
  "/me",
  validate(updateUserSchema, "body"),
  authenticate,
  updateProfile,
);

export default router;
