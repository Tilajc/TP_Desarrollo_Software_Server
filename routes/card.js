import { Router } from "express";
import {
  getCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
} from "../controllers/card.js";
import { createCardSchema, updateCardSchema } from "../schemas/card.js";
import validate from "../middlewares/validate.js";

const router = Router();

router.get("/", getCards);
router.get("/:id", getCardById);
router.post("/", validate(createCardSchema, "body"), createCard);
router.put("/:id", validate(updateCardSchema, "body"), updateCard);
router.delete("/:id", deleteCard);

export default router;
