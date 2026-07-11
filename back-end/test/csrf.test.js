const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCsrf } = require('../middleware/csrf');

test('validateCsrf rejects state-changing requests without a valid CSRF token', async () => {
  let statusCode = 200;
  let responseBody = null;

  const req = {
    method: 'POST',
    headers: {},
    cookies: {},
  };

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      responseBody = payload;
      return this;
    },
  };

  let called = false;
  const next = () => {
    called = true;
  };

  validateCsrf(req, res, next);

  assert.equal(statusCode, 403);
  assert.equal(called, false);
  assert.equal(responseBody.success, false);
});
