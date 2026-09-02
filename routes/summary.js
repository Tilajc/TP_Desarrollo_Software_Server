import { Router } from "express";
import {
  getSummaries,
  getSummaryById,
  createSummary,
  updateSummary,
  deleteSummary,
} from "../controllers/summary.js";
import {
  createSummarySchema,
  updateSummarySchema,
} from "../schemas/summary.js";
import validate from "../middlewares/validate.js";

const router = Router();

router.get("/", getSummaries);
router.get("/:id", getSummaryById);
router.post("/", validate(createSummarySchema, "body"), createSummary);
router.put("/:id", validate(updateSummarySchema, "body"), updateSummary);
router.delete("/:id", deleteSummary);

export default router;
