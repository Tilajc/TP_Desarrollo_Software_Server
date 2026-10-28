import * as courseService from "../services/course.js";

export const getCourses = async (req, res) => {
  try {
    const courses = await courseService.getCoursesService(req.query);
    return res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener los cursos",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const courseItem = await courseService.getCourseByIdService(
      req.user,
      req.params.id,
    );
    return res.status(200).json(courseItem);
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener el curso",
    });
  }
};

export const createCourse = async (req, res) => {
  try {
    const course = await courseService.createCourseService(req.user, req.body);
    return res.status(201).json(course);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "El autor ya tiene un curso para esta materia",
      });
    }

    console.error("Error creating course:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al crear el curso",
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const updatedCourse = await courseService.updateCourseService(
      req.user,
      req.params.id,
      req.body,
    );
    return res.status(200).json(updatedCourse);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "El autor ya tiene un curso para esta materia",
      });
    }

    console.error("Error updating course:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al actualizar el curso",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const result = await courseService.deleteCourseService(
      req.user,
      req.params.id,
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error al eliminar el curso",
    });
  }
};
