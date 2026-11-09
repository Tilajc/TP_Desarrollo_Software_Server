import {
  getUsersService,
  getUserByIdService,
  createUserService,
} from "../../services/user.js";
import prisma from "../../lib/prisma.js";
import bcrypt from "bcryptjs";

jest.mock("../../lib/prisma.js", () => ({
  user: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password_mock"),
}));

describe("User Services - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsersService", () => {
    it("should return a list of active users", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "Juan",
          lastName: "Pérez",
          email: "juan@test.com",
          role: "USER",
        },
        {
          id: 2,
          name: "Ana",
          lastName: "Gómez",
          email: "ana@test.com",
          role: "ADMIN",
        },
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await getUsersService();

      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { active: true },
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          role: true,
        },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe("getUserByIdService", () => {
    it("should return a user if they exist and are active", async () => {
      const mockUser = {
        id: 1,
        name: "Juan",
        lastName: "Pérez",
        email: "juan@test.com",
        role: "USER",
      };

      prisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await getUserByIdService(1);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 1, active: true },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if the user does not exist", async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await getUserByIdService(99);

      expect(result).toBeNull();
    });
  });

  describe("createUserService", () => {
    it("should create a new user successfully if the email is not in use", async () => {
      const userData = {
        name: "Carlos",
        lastName: "López",
        email: "carlos@test.com",
        password: "password123",
        role: "USER",
      };

      prisma.user.findUnique.mockResolvedValue(null);

      const createdUserMock = {
        id: 3,
        ...userData,
        password: "hashed_password_mock",
      };
      prisma.user.create.mockResolvedValue({
        id: 3,
        name: userData.name,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      });

      const result = await createUserService(userData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toHaveProperty("id", 3);
      expect(result.email).toBe(userData.email);
    });

    it("should throw a 409 error if the email is already registered", async () => {
      const userData = {
        name: "Carlos",
        lastName: "López",
        email: "existente@test.com",
        password: "password123",
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "existente@test.com",
      });

      await expect(createUserService(userData)).rejects.toMatchObject({
        message: "El email ya está registrado",
        status: 409,
      });

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });
});
