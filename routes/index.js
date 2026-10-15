import { Router } from "express";
import cardRoutes from "./card.js";
import classRoutes from "./class.js";
import classSubscriptionRoutes from "./classSubscription.js";
import hintRoutes from "./hint.js";
import subjectRoutes from "./subject.js";
import summaryRoutes from "./summary.js";
import topicRoutes from "./topic.js";
import userRoutes from "./user.js";
import authRoutes from "./auth.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

router.use(authenticate);

router.use("/cards", cardRoutes);
router.use("/classes", classRoutes);
router.use("/class-subscriptions", classSubscriptionRoutes);
router.use("/hints", hintRoutes);
router.use("/subjects", subjectRoutes);
router.use("/summaries", summaryRoutes);
router.use("/topics", topicRoutes);

export default router;
