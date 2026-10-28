import * as userService from "../services/user.js";

export const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsersService();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener los usuarios",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserByIdService(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener el usuario",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUserService(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al crear el usuario",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUserService(
      req.params.id,
      req.body,
    );
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al actualizar el usuario",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUserService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al eliminar el usuario",
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const newUser = await userService.registerUserService(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al crear el usuario",
    });
  }
};

export const editProfile = async (req, res) => {
  try {
    const updatedUser = await userService.editProfileService(
      req.user.id,
      req.body,
    );
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al actualizar el perfil",
    });
  }
};
