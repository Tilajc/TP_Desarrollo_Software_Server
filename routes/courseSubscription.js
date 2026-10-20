import { Router } from "express";
import {
  getCourseSubscriptions,
  getCourseSubscriptionById,
  createCourseSubscription,
  updateCourseSubscription,
  deleteCourseSubscription,
} from "../controllers/courseSubscription.js";
import {
  createCourseSubscriptionSchema,
  updateCourseSubscriptionSchema,
} from "../schemas/courseSubscription.js";
import validate from "../middlewares/validate.js";

const router = Router();

router.get("/", getCourseSubscriptions);
router.get("/:id", getCourseSubscriptionById);
router.post(
  "/",
  validate(createCourseSubscriptionSchema, "body"),
  createCourseSubscription,
);
router.put(
  "/:id",
  validate(updateCourseSubscriptionSchema, "body"),
  updateCourseSubscription,
);
router.delete("/:id", deleteCourseSubscription);

export default router;
