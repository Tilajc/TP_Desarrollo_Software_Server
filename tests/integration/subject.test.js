import request from "supertest";
import index from "../../index.js";
import prisma from "../../lib/prisma.js";

jest.mock("../../lib/prisma.js", () => ({
  subject: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("../../middlewares/auth.js", () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role: "ADMIN" };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

describe("Subject Integration Tests (/api/subjects)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/subjects", () => {
    it("should return a list of active subjects successfully", async () => {
      const mockSubjects = [
        {
          id: 1,
          name: "Análisis Matemático I",
          description: "Cálculo",
          active: true,
        },
        {
          id: 2,
          name: "Redes de Datos",
          description: "Protocolos",
          active: true,
        },
      ];
      prisma.subject.findMany.mockResolvedValue(mockSubjects);

      const response = await request(index)
        .get("/api/subjects")
        .set("Authorization", "Bearer fake-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSubjects);
    });
  });

  describe("GET /api/subjects/:id", () => {
    it("should return a subject by id when it exists", async () => {
      const mockSubject = {
        id: 1,
        name: "Análisis Matemático I",
        description: "Cálculo",
        active: true,
      };
      prisma.subject.findFirst.mockResolvedValue(mockSubject);

      const response = await request(index)
        .get("/api/subjects/1")
        .set("Authorization", "Bearer fake-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSubject);
    });

    it("should return 404 when subject does not exist", async () => {
      prisma.subject.findFirst.mockResolvedValue(null);

      const response = await request(index)
        .get("/api/subjects/999")
        .set("Authorization", "Bearer fake-token");

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/subjects", () => {
    it("should create a new subject successfully", async () => {
      const newSubject = {
        name: "Desarrollo de Software",
        description: "Arquitectura web y testing",
      };
      const createdSubject = { id: 3, ...newSubject, active: true };

      prisma.subject.findFirst.mockResolvedValue(null);
      prisma.subject.create.mockResolvedValue(createdSubject);

      const response = await request(index)
        .post("/api/subjects")
        .set("Authorization", "Bearer fake-token")
        .send(newSubject);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdSubject);
    });

    it("should return 400 when validation fails (missing or short name)", async () => {
      const response = await request(index)
        .post("/api/subjects")
        .set("Authorization", "Bearer fake-token")
        .send({ name: "AB" });

      expect(response.status).toBe(400);
      expect(prisma.subject.create).not.toHaveBeenCalled();
    });
  });
});
