import { Router } from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/course.js";
import { createCourseSchema, updateCourseSchema } from "../schemas/course.js";
import validate from "../middlewares/validate.js";

const router = Router();

router.get("/", getCourses);
router.get("/:id", getCourseById);
router.post("/", validate(createCourseSchema, "body"), createCourse);
router.put("/:id", validate(updateCourseSchema, "body"), updateCourse);
router.delete("/:id", deleteCourse);

export default router;
