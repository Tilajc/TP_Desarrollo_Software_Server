import { Router } from "express";
import {
  getHints,
  getHintById,
  createHint,
  updateHint,
  deleteHint,
} from "../controllers/hint.js";
import { createHintSchema, updateHintSchema } from "../schemas/hint.js";
import validate from "../middlewares/validate.js";

const router = Router();

router.get("/", getHints);
router.get("/:id", getHintById);
router.post("/", validate(createHintSchema, "body"), createHint);
router.put("/:id", validate(updateHintSchema, "body"), updateHint);
router.delete("/:id", deleteHint);

export default router;
