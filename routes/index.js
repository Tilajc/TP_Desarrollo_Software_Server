import { Router } from "express";
import subjectRoutes from "./subject.js";
import userRoutes from "./user.js";
import topicRoutes from "./topic.js";
import classRoutes from "./class.js";
import cardRoutes from "./card.js";

const router = Router();

router.use("/subjects", subjectRoutes);
router.use("/users", userRoutes);
router.use("/topics", topicRoutes);
router.use("/classes", classRoutes);
router.use("/cards", cardRoutes);

export default router;
