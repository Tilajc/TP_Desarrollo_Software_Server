import {
  getCoursesService,
  getCourseByIdService,
  createCourseService,
  updateCourseService,
  deleteCourseService,
} from "../../services/course.js";
import prisma from "../../lib/prisma.js";
import * as access from "../../lib/access.js";

jest.mock("../../lib/prisma.js", () => ({
  course: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
  },
  subject: {
    findFirst: jest.fn(),
  },
}));

jest.mock("../../lib/access.js", () => ({
  isAdmin: jest.fn(),
  canManage: jest.fn(),
  authorSelect: { id: true, name: true, lastName: true },
}));

describe("Course Services - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCoursesService", () => {
    it("should return a list of active courses applying optional filters", async () => {
      const mockCourses = [{ id: 1, authorId: 2, subjectId: 3 }];
      prisma.course.findMany.mockResolvedValue(mockCourses);

      const result = await getCoursesService({ subjectId: 3 });

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            active: true,
            subjectId: 3,
          }),
        }),
      );
      expect(result).toEqual(mockCourses);
    });
  });

  describe("getCourseByIdService", () => {
    it("should return the course and hide subscriptions if the user cannot manage it", async () => {
      const mockUser = { id: 2, role: "USER" };
      const mockCourse = {
        id: 1,
        authorId: 5,
        courseSubscriptions: [{ id: 10 }],
      };

      prisma.course.findFirst.mockResolvedValue(mockCourse);
      access.canManage.mockReturnValue(false);

      const result = await getCourseByIdService(mockUser, 1);

      expect(access.canManage).toHaveBeenCalledWith(mockUser, 5);
      expect(result).not.toHaveProperty("courseSubscriptions");
    });

    it("should throw a 404 error if the course does not exist", async () => {
      prisma.course.findFirst.mockResolvedValue(null);

      await expect(getCourseByIdService({ id: 1 }, 99)).rejects.toMatchObject({
        message: "Curso no encontrado",
        status: 404,
      });
    });
  });

  describe("createCourseService", () => {
    it("should create a course successfully if the author and subject exist", async () => {
      const mockUser = { id: 1, role: "USER" };
      const courseData = { subjectId: 2 };

      prisma.user.findFirst.mockResolvedValue({ id: 1, active: true });
      prisma.subject.findFirst.mockResolvedValue({ id: 2, active: true });
      prisma.course.findUnique.mockResolvedValue(null);
      prisma.course.create.mockResolvedValue({
        id: 1,
        authorId: 1,
        subjectId: 2,
      });

      const result = await createCourseService(mockUser, courseData);

      expect(prisma.course.create).toHaveBeenCalled();
      expect(result).toHaveProperty("id", 1);
    });

    it("should throw a 403 error if a common user tries to create a course for another author", async () => {
      const mockUser = { id: 1, role: "USER" };
      const courseData = { subjectId: 2, authorId: 99 };

      access.isAdmin.mockReturnValue(false);

      await expect(
        createCourseService(mockUser, courseData),
      ).rejects.toMatchObject({
        message: "No tenés permisos para realizar esta acción",
        status: 403,
      });
    });

    it("should throw a 409 error if a course already exists for that author and subject", async () => {
      const mockUser = { id: 1, role: "USER" };
      const courseData = { subjectId: 2 };

      prisma.user.findFirst.mockResolvedValue({ id: 1, active: true });
      prisma.subject.findFirst.mockResolvedValue({ id: 2, active: true });
      prisma.course.findUnique.mockResolvedValue({ id: 5, active: true });

      await expect(
        createCourseService(mockUser, courseData),
      ).rejects.toMatchObject({
        message: "El autor ya tiene un curso para esta materia",
        status: 409,
      });
    });
  });

  describe("deleteCourseService", () => {
    it("should mark the course as inactive if the user has permissions", async () => {
      const mockUser = { id: 1, role: "ADMIN" };
      prisma.course.findFirst.mockResolvedValue({
        id: 1,
        authorId: 1,
        active: true,
      });
      access.canManage.mockReturnValue(true);
      prisma.course.update.mockResolvedValue({});

      const result = await deleteCourseService(mockUser, 1);

      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: false },
      });
      expect(result).toEqual({ message: "Curso eliminado correctamente" });
    });

    it("should throw a 403 error if the user cannot manage the course", async () => {
      const mockUser = { id: 2, role: "USER" };
      prisma.course.findFirst.mockResolvedValue({
        id: 1,
        authorId: 1,
        active: true,
      });
      access.canManage.mockReturnValue(false);

      await expect(deleteCourseService(mockUser, 1)).rejects.toMatchObject({
        message: "No tenés permisos para realizar esta acción",
        status: 403,
      });
    });
  });
});
