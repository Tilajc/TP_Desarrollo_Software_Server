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
import { authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/", getSubjects);
router.get("/:id", getSubjectById);
router.post(
  "/",
  authorize("ADMIN"),
  validate(createSubjectSchema, "body"),
  createSubject,
);
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateSubjectSchema, "body"),
  updateSubject,
);
router.delete("/:id", authorize("ADMIN"), deleteSubject);

export default router;
