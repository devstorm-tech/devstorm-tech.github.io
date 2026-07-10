const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeCoursePayload } = require('../services/CourseService');

test('normalizeCoursePayload fills defaults and creates a slug', () => {
  const payload = normalizeCoursePayload({
    title: 'React for Beginners',
    category: 'Web',
    description: 'Build modern apps',
    price: 99,
    level: 'Intermediate',
  });

  assert.equal(payload.title, 'React for Beginners');
  assert.equal(payload.slug, 'react-for-beginners');
  assert.equal(payload.level, 'Intermediate');
  assert.equal(payload.price, 99);
  assert.equal(payload.featured, false);
  assert.equal(payload.students, 0);
  assert.equal(payload.lessons, 0);
});
