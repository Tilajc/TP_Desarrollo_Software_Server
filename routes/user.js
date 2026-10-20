import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  registerUser,
  editProfile,
} from "../controllers/user.js";
import { createUserSchema, updateUserSchema } from "../schemas/user.js";
import validate from "../middlewares/validate.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.post("/register", validate(createUserSchema, "body"), registerUser);

router.use(authenticate);

router.put("/profile", validate(updateUserSchema, "body"), editProfile);

router.use(authorize("ADMIN"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", validate(createUserSchema, "body"), createUser);
router.put("/:id", validate(updateUserSchema, "body"), updateUser);
router.delete("/:id", deleteUser);

export default router;
