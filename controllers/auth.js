import * as authService from "../services/auth.js"; // Si tu archivo en services se llama auth.service.js, cambiá la ruta acá

export const login = async (req, res) => {
  try {
    const result = await authService.loginService(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error logging in:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Error al iniciar sesión" });
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json(req.user);
};

export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await authService.updateProfileService(
      req.user.id,
      req.body,
    );
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Error al actualizar el perfil" });
  }
};
