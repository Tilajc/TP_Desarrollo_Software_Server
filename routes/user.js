import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.js";
import { createUserSchema, updateUserSchema } from "../schemas/user.js";
import validate from "../middlewares/validate.js";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", validate(createUserSchema, "body"), createUser);
router.put("/:id", validate(updateUserSchema, "body"), updateUser);
router.delete("/:id", deleteUser);

export default router;
