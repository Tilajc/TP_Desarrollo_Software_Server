import { Router } from "express";
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from "../controllers/class.js";
import { createClassSchema, updateClassSchema } from "../schemas/class.js";
import validate from "../middlewares/validate.js";

const router = Router();

router.get("/", getClasses);
router.get("/:id", getClassById);
router.post("/", validate(createClassSchema, "body"), createClass);
router.put("/:id", validate(updateClassSchema, "body"), updateClass);
router.delete("/:id", deleteClass);

export default router;
