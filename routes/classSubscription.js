import { Router } from "express";
import {
  getClassSubscriptions,
  getClassSubscriptionById,
  createClassSubscription,
  updateClassSubscription,
  deleteClassSubscription,
} from "../controllers/classSubscription.js";
import {
  createClassSubscriptionSchema,
  updateClassSubscriptionSchema,
} from "../schemas/classSubscription.js";
import validate from "../middlewares/validate.js";

const router = Router();

router.get("/", getClassSubscriptions);
router.get("/:id", getClassSubscriptionById);
router.post(
  "/",
  validate(createClassSubscriptionSchema, "body"),
  createClassSubscription,
);
router.put(
  "/:id",
  validate(updateClassSubscriptionSchema, "body"),
  updateClassSubscription,
);
router.delete("/:id", deleteClassSubscription);

export default router;
