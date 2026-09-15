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

const router = Router();

router.get("/", getTopics);
router.get("/:id", getTopicById);
router.post("/", validate(createTopicSchema, "body"), createTopic);
router.put("/:id", validate(updateTopicSchema, "body"), updateTopic);
router.delete("/:id", deleteTopic);

export default router;
