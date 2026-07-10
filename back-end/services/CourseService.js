const Course = require('../models/Course');

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const normalizeCoursePayload = (payload = {}) => ({
  title: payload.title?.trim(),
  slug: payload.slug || slugify(payload.title),
  category: payload.category?.trim(),
  description: payload.description?.trim(),
  price: payload.price ?? 0,
  discount_price: payload.discount_price ?? null,
  duration: payload.duration?.trim() || 'Unknown',
  level: payload.level?.trim() || 'Beginner',
  instructor: payload.instructor?.trim() || 'DevStorm Instructor',
  lessons: Number(payload.lessons ?? 0),
  students: Number(payload.students ?? 0),
  rating: Number(payload.rating ?? 4.5),
  featured: Boolean(payload.featured ?? false),
  icon: payload.icon?.trim() || 'fas fa-graduation-cap',
  color: payload.color?.trim() || 'courses-card-blue',
  topics: Array.isArray(payload.topics) ? payload.topics : [],
  published_at: payload.published_at ? new Date(payload.published_at) : new Date(),
});

class CourseService {
  static async listCourses(query = {}) {
    const filters = {};

    if (query.category) {
      filters.category = new RegExp(query.category, 'i');
    }

    if (query.level) {
      filters.level = new RegExp(query.level, 'i');
    }

    if (query.featured === 'true') {
      filters.featured = true;
    }

    const sort = query.sort === 'newest' ? { createdAt: -1 } : { students: -1, createdAt: -1 };
    return Course.find(filters).sort(sort);
  }

  static async getCourseById(id) {
    return Course.findById(id);
  }

  static async getCourseBySlug(slug) {
    return Course.findOne({ slug });
  }

  static async createCourse(payload) {
    const data = normalizeCoursePayload(payload);
    const course = new Course(data);
    return course.save();
  }

  static async updateCourse(id, payload) {
    const data = normalizeCoursePayload(payload);
    return Course.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  static async deleteCourse(id) {
    return Course.findByIdAndDelete(id);
  }
}

module.exports = { CourseService, normalizeCoursePayload };
