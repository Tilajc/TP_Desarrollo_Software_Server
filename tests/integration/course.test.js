import request from "supertest";
import index from "../../index.js";
import prisma from "../../lib/prisma.js";

jest.mock("../../lib/prisma.js", () => ({
  course: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
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

describe("Course Integration Tests (/api/courses)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/courses", () => {
    it("should return a list of active courses successfully", async () => {
      const mockCourses = [{ id: 1, authorId: 1, subjectId: 2 }];
      prisma.course.findMany.mockResolvedValue(mockCourses);

      const response = await request(index)
        .get("/api/courses")
        .set("Authorization", "Bearer fake-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCourses);
    });
  });
});
