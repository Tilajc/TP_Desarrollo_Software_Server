import { Router } from "express";
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subject.js";
import {
  createSubjectSchema,
  updateSubjectSchema,
} from "../schemas/subject.js";
import validate from "../middlewares/validate.js";

const router = Router();

router.get("/", getSubjects);
router.get("/:id", getSubjectById);
router.post("/", validate(createSubjectSchema, "body"), createSubject);
router.put("/:id", validate(updateSubjectSchema, "body"), updateSubject);
router.delete("/:id", deleteSubject);

export default router;
