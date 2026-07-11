const util = require('util');

function isFunction(value) {
  return typeof value === 'function';
}

function describeHandler(fn) {
  if (!fn) return 'undefined';
  return fn.name || '<anonymous function>'; 
}

/**
 * Preflight check and register routes onto an Express router.
 * - routes: [{ method, path, handlers: [fn,...] }]
 * Logs descriptive errors if any handler is missing/undefined.
 */
function preflightCheckAndRegister(router, routes) {
  if (!Array.isArray(routes)) return;

  routes.forEach((r) => {
    const { method, path, handlers } = r;

    if (!method || !path || !Array.isArray(handlers)) {
      console.error(`[preflight] Invalid route definition for path=${path} method=${method}`);
      return;
    }

    const problems = [];
    // Accept functions or arrays of functions (express-validator returns arrays)
    handlers.forEach((h, idx) => {
      if (Array.isArray(h)) {
        h.forEach((inner, j) => {
          if (!isFunction(inner)) {
            const hint = inner && typeof inner === 'object' && inner.name ? inner.name : util.inspect(inner, { depth: 0 });
            problems.push({ index: `${idx}[${j}]`, value: hint });
          }
        });
      } else if (!isFunction(h)) {
        const hint = h && typeof h === 'object' && h.name ? h.name : util.inspect(h, { depth: 0 });
        problems.push({ index: idx, value: hint });
      }
    });

    if (problems.length > 0) {
      console.error(`[preflight] Route registration skipped for ${method.toUpperCase()} ${path}`);
      problems.forEach((p) => {
        console.error(`  - handler[${p.index}] is not a function: ${p.value}`);
      });
      return; // skip registering this route to avoid runtime TypeError
    }

    // All good — register route
    try {
      const fn = router[method];
      if (!isFunction(fn)) {
        console.error(`[preflight] Router does not support method '${method}' for path=${path}`);
        return;
      }
      // Flatten handler arrays one level for registration
      const flattened = handlers.flatMap((h) => (Array.isArray(h) ? h : [h]));
      router[method](path, ...flattened);
    } catch (err) {
      console.error(`[preflight] Failed to register ${method.toUpperCase()} ${path}:`, err && err.stack ? err.stack : err);
    }
  });
}

module.exports = {
  preflightCheckAndRegister,
};
