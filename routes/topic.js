import { Router } from "express";
import {
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topic.js";
import { createTopicSchema, updateTopicSchema } from "../schemas/topic.js";
import validate from "../middlewares/validate.js";
import { authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/", getTopics);
router.get("/:id", getTopicById);
router.post(
  "/",
  authorize("ADMIN"),
  validate(createTopicSchema, "body"),
  createTopic,
);
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateTopicSchema, "body"),
  updateTopic,
);
router.delete("/:id", authorize("ADMIN"), deleteTopic);

export default router;
