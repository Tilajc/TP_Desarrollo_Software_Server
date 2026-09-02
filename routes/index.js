import { Router } from "express";
import subjectRoutes from "./subject.js";
import userRoutes from "./user.js";
import topicRoutes from "./topic.js";
import classRoutes from "./class.js";
import cardRoutes from "./card.js";
import summaryRoutes from "./summary.js";
import hintRoutes from "./hint.js";
import classSubscriptionRoutes from "./classSubscription.js";

const router = Router();

router.use("/subjects", subjectRoutes);
router.use("/users", userRoutes);
router.use("/topics", topicRoutes);
router.use("/classes", classRoutes);
router.use("/cards", cardRoutes);
router.use("/summaries", summaryRoutes);
router.use("/hints", hintRoutes);

export default router;
