const { CourseService } = require('../services/CourseService');

class CourseController {
  static async listCourses(req, res, next) {
    try {
      const courses = await CourseService.listCourses(req.query);
      res.status(200).json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  }

  static async getCourse(req, res, next) {
    try {
      const course = req.params.slug
        ? await CourseService.getCourseBySlug(req.params.slug)
        : await CourseService.getCourseById(req.params.id);

      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      res.status(200).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  static async createCourse(req, res, next) {
    try {
      const course = await CourseService.createCourse(req.body);
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  static async updateCourse(req, res, next) {
    try {
      const course = await CourseService.updateCourse(req.params.id, req.body);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCourse(req, res, next) {
    try {
      const course = await CourseService.deleteCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      res.status(200).json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CourseController;
