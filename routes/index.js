import { Router } from "express";
import subjectRoutes from "./subject.js";
// import userRoutes from "./user.js";
// import classRoutes from "./class.js";

const router = Router();

router.use("/subjects", subjectRoutes);
// router.use("/users", userRoutes);
// router.use("/classes", classRoutes);

export default router;
