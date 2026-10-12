import { Router } from "express";
import cardRoutes from "./card.js";
import classRoutes from "./class.js";
import classSubscriptionRoutes from "./classSubscription.js";
import hintRoutes from "./hint.js";
import subjectRoutes from "./subject.js";
import summaryRoutes from "./summary.js";
import topicRoutes from "./topic.js";
import userRoutes from "./user.js";

const router = Router();

router.use("/cards", cardRoutes);
router.use("/classes", classRoutes);
router.use("/class-subscriptions", classSubscriptionRoutes);
router.use("/hints", hintRoutes);
router.use("/subjects", subjectRoutes);
router.use("/summaries", summaryRoutes);
router.use("/topics", topicRoutes);
router.use("/users", userRoutes);

export default router;
