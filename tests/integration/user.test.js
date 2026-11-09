import request from "supertest";
import index from "../../index.js";
import prisma from "../../lib/prisma.js";

jest.mock("../../lib/prisma.js", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
  },
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  }),
);

describe("Integration Tests - Users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/users/register", () => {
    it("should fail with error 400 if required fields are missing (Zod Validation)", async () => {
      const response = await request(index).post("/api/users/register").send({
        name: "Incompleto",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation error");
    });

    it("should register a user successfully when the data is valid", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        name: "Test",
        lastName: "User",
        email: "test@test.com",
        role: "USER",
      });

      const response = await request(index).post("/api/users/register").send({
        name: "Test",
        lastName: "User",
        email: "test@test.com",
        password: "password123",
        turnstileToken: "fake-token",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("email", "test@test.com");
    });
  });
});
