import { Router } from "express";
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getDeletedSubjects,
  restoreSubject,
} from "../controllers/subject.js";
import {
  createSubjectSchema,
  updateSubjectSchema,
} from "../schemas/subject.js";
import validate from "../middlewares/validate.js";
import { authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/", getSubjects);
router.get("/deleted", authorize("ADMIN"), getDeletedSubjects);
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
router.post("/:id/restore", authorize("ADMIN"), restoreSubject);

export default router;
