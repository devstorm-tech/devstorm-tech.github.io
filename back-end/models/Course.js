const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 2,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: 10,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount_price: {
      type: Number,
      default: null,
      min: 0,
    },
    duration: {
      type: String,
      default: 'Unknown',
    },
    level: {
      type: String,
      default: 'Beginner',
    },
    instructor: {
      type: String,
      default: 'DevStorm Instructor',
    },
    lessons: {
      type: Number,
      default: 0,
      min: 0,
    },
    students: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: 'fas fa-graduation-cap',
    },
    color: {
      type: String,
      default: 'courses-card-blue',
    },
    topics: {
      type: [String],
      default: [],
    },
    published_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
