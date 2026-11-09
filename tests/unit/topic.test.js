import {
  getTopicsService,
  getTopicByIdService,
  createTopicService,
  updateTopicService,
  deleteTopicService,
} from "../../services/topic.js";
import prisma from "../../lib/prisma.js";

jest.mock("../../lib/prisma.js", () => ({
  topic: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  subject: {
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
  hint: { updateMany: jest.fn() },
  card: { updateMany: jest.fn() },
  summary: { updateMany: jest.fn() },
}));

describe("Topic Services - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTopicsService", () => {
    it("should return the active topics filtered by subjectId if provided", async () => {
      const mockTopics = [{ id: 1, name: "Cálculo", subjectId: 2 }];
      prisma.topic.findMany.mockResolvedValue(mockTopics);

      const result = await getTopicsService({ subjectId: 2 });

      expect(prisma.topic.findMany).toHaveBeenCalledWith({
        where: { active: true, subjectId: 2 },
        include: { subject: true },
      });
      expect(result).toEqual(mockTopics);
    });
  });

  describe("createTopicService", () => {
    it("should create a topic successfully if the subject exists and the name is unique", async () => {
      const topicData = { name: "Derivadas", subjectId: 1 };

      prisma.subject.findFirst.mockResolvedValue({ id: 1, active: true });
      prisma.topic.findMany.mockResolvedValue([]);
      prisma.topic.create.mockResolvedValue({ id: 10, ...topicData });

      const result = await createTopicService(topicData);

      expect(prisma.subject.findFirst).toHaveBeenCalledWith({
        where: { id: 1, active: true },
      });
      expect(prisma.topic.create).toHaveBeenCalled();
      expect(result).toHaveProperty("id", 10);
    });

    it("should throw a 404 error if the subject does not exist", async () => {
      prisma.subject.findFirst.mockResolvedValue(null);

      await expect(
        createTopicService({ name: "Derivadas", subjectId: 99 }),
      ).rejects.toMatchObject({
        message: "La materia especificada no existe o no está activa",
        status: 404,
      });
    });

    it("should throw a 409 error if a topic already exists with the same normalized name", async () => {
      prisma.subject.findFirst.mockResolvedValue({ id: 1, active: true });
      prisma.topic.findMany.mockResolvedValue([{ name: "Cálculo I" }]);

      await expect(
        createTopicService({ name: "Calculo i", subjectId: 1 }),
      ).rejects.toMatchObject({
        message: "Ya existe un tema con ese nombre en esta materia",
        status: 409,
      });
    });
  });

  describe("deleteTopicService", () => {
    it("should perform the cascading deactivation transaction if the topic exists", async () => {
      prisma.topic.findFirst.mockResolvedValue({ id: 1, active: true });
      prisma.$transaction.mockResolvedValue([]);

      const result = await deleteTopicService(1);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: "Tema eliminado correctamente" });
    });

    it("should throw a 404 error if the topic does not exist", async () => {
      prisma.topic.findFirst.mockResolvedValue(null);

      await expect(deleteTopicService(99)).rejects.toMatchObject({
        message: "Tema no encontrado",
        status: 404,
      });
    });
  });
});
