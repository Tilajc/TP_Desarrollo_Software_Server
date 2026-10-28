import * as subjectService from "../services/subject.js"; // o "../services/subject.service.js"

export const getSubjects = async (req, res) => {
  try {
    const subjects = await subjectService.getSubjectsService();
    return res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener las materias",
    });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await subjectService.getSubjectByIdService(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    return res.status(200).json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener la materia",
    });
  }
};

export const createSubject = async (req, res) => {
  try {
    const newSubject = await subjectService.createSubjectService(req.body);
    return res.status(201).json(newSubject);
  } catch (error) {
    console.error("Error creating subject:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al crear la materia",
    });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const updatedSubject = await subjectService.updateSubjectService(
      req.params.id,
      req.body,
    );
    return res.status(200).json(updatedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al actualizar la materia",
    });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const result = await subjectService.deleteSubjectService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting subject:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al eliminar la materia",
    });
  }
};
