import { Router } from "express";
import cardRoutes from "./card.js";
import courseRoutes from "./course.js";
import courseSubscriptionRoutes from "./courseSubscription.js";
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
router.use("/courses", courseRoutes);
router.use("/course-subscriptions", courseSubscriptionRoutes);
router.use("/hints", hintRoutes);
router.use("/subjects", subjectRoutes);
router.use("/summaries", summaryRoutes);
router.use("/topics", topicRoutes);

export default router;
