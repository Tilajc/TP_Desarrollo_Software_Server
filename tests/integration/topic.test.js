import request from "supertest";
import index from "../../index.js";
import prisma from "../../lib/prisma.js";

jest.mock("../../lib/prisma.js", () => ({
  topic: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  subject: {
    findFirst: jest.fn(),
  },
}));

jest.mock("../../middlewares/auth.js", () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role: "ADMIN" };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

describe("Topic Integration Tests (/api/topics)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/topics", () => {
    it("should return a list of topics successfully", async () => {
      const mockTopics = [{ id: 1, name: "Calculus", subjectId: 1 }];
      prisma.topic.findMany.mockResolvedValue(mockTopics);

      const response = await request(index)
        .get("/api/topics")
        .set("Authorization", "Bearer fake-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTopics);
    });
  });
});
