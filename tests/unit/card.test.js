import {
  getCardsService,
  createCardService,
  deleteCardService,
} from "../../services/card.js";
import prisma from "../../lib/prisma.js";
import * as access from "../../lib/access.js";

jest.mock("../../lib/prisma.js", () => ({
  card: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  topic: {
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
  hint: { updateMany: jest.fn() },
}));

jest.mock("../../lib/access.js", () => ({
  accessibleContentWhere: jest.fn().mockResolvedValue({}),
  hasCourse: jest.fn().mockResolvedValue(true),
  canManage: jest.fn().mockReturnValue(true),
  authorSelect: { id: true, name: true, lastName: true },
}));

describe("Card Services - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCardsService", () => {
    it("should return cards applying access filters and topicId", async () => {
      const mockUser = { id: 1, role: "USER" };
      const mockCards = [
        { id: 1, question: "¿Qué es una derivada?", topicId: 2 },
      ];

      prisma.card.findMany.mockResolvedValue(mockCards);

      const result = await getCardsService(mockUser, { topicId: 2 });

      expect(prisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            active: true,
            topicId: 2,
          }),
        }),
      );
      expect(result).toEqual(mockCards);
    });
  });

  describe("createCardService", () => {
    it("should create a card successfully if the topic exists and the user has the course", async () => {
      const mockUser = { id: 1 };
      const cardData = {
        question: "Pregunta",
        answer: "Respuesta",
        topicId: 5,
      };

      prisma.topic.findFirst.mockResolvedValue({
        id: 5,
        subjectId: 10,
        active: true,
      });
      access.hasCourse.mockResolvedValue(true);
      prisma.card.create.mockResolvedValue({ id: 1, ...cardData, authorId: 1 });

      const result = await createCardService(mockUser, cardData);

      expect(access.hasCourse).toHaveBeenCalledWith(1, 10);
      expect(prisma.card.create).toHaveBeenCalled();
      expect(result).toHaveProperty("id", 1);
    });

    it("should throw a 403 error if the user does not have the course of the subject", async () => {
      const mockUser = { id: 1 };
      const cardData = { question: "P", answer: "R", topicId: 5 };

      prisma.topic.findFirst.mockResolvedValue({
        id: 5,
        subjectId: 10,
        active: true,
      });
      access.hasCourse.mockResolvedValue(false);

      await expect(createCardService(mockUser, cardData)).rejects.toMatchObject(
        {
          message: "Primero hay que crear el curso de esta materia",
          status: 403,
        },
      );
    });
  });

  describe("deleteCardService", () => {
    it("should deactivate the card and its hints using a transaction if the user has management permissions", async () => {
      const mockUser = { id: 1, role: "ADMIN" };
      prisma.card.findFirst.mockResolvedValue({
        id: 1,
        authorId: 2,
        active: true,
      });
      access.canManage.mockReturnValue(true);
      prisma.$transaction.mockResolvedValue([]);

      const result = await deleteCardService(mockUser, 1);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: "Tarjeta eliminada correctamente" });
    });

    it("should throw a 403 error if the user does not have management permissions", async () => {
      const mockUser = { id: 1, role: "USER" };
      prisma.card.findFirst.mockResolvedValue({
        id: 1,
        authorId: 2,
        active: true,
      });
      access.canManage.mockReturnValue(false);

      await expect(deleteCardService(mockUser, 1)).rejects.toMatchObject({
        message: "No tenés permisos para realizar esta acción",
        status: 403,
      });
    });
  });
});
