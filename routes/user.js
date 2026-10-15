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
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), getUsers);
router.get("/:id", authenticate, authorize("ADMIN"), getUserById);
router.post("/", validate(createUserSchema, "body"), createUser);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateUserSchema, "body"),
  updateUser,
);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteUser);

export default router;
