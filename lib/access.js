import prisma from "../lib/prisma.js";

export const authorSelect = {
  id: true,
  name: true,
  lastName: true,
};

export const isAdmin = (user) => user.role === "ADMIN";

export const canManage = (user, ownerId) =>
  isAdmin(user) || user.id === ownerId;

export const hasCourse = async (authorId, subjectId) =>
  Boolean(
    await prisma.course.findFirst({
      where: { authorId, subjectId, active: true },
      select: { id: true },
    }),
  );

export const accessibleContentWhere = async (user) => {
  if (isAdmin(user)) return {};

  const courseSubs = await prisma.courseSubscription.findMany({
    where: { subscriberId: user.id, active: true, course: { active: true } },
    select: { course: { select: { authorId: true, subjectId: true } } },
  });

  return {
    OR: [
      { authorId: user.id },
      ...courseSubs.map(({ course }) => ({
        authorId: course.authorId,
        topic: { subjectId: course.subjectId },
      })),
    ],
  };
};
