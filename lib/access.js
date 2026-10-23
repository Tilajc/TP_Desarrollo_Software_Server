export const authorSelect = {
  id: true,
  name: true,
  lastName: true,
};

export const isAdmin = (user) => user.role === "ADMIN";

export const canManage = (user, ownerId) =>
  isAdmin(user) || user.id === ownerId;
