import request from "supertest";
import index from "../../index.js";
import prisma from "../../lib/prisma.js";

jest.mock("../../lib/prisma.js", () => ({
  card: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  courseSubscription: {
    findMany: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("../../middlewares/auth.js", () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role: "USER" };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

describe("Card Integration Tests (/api/cards)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/cards", () => {
    it("should return a list of cards for authenticated users", async () => {
      const mockCards = [
        { id: 1, question: "What is a limit?", answer: "A value..." },
      ];
      prisma.card.findMany.mockResolvedValue(mockCards);

      const response = await request(index)
        .get("/api/cards")
        .set("Authorization", "Bearer fake-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCards);
    });
  });
});
