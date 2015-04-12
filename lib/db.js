var createError = require('http-errors');

exports.badRequest = function(msg, err) {
  return createError(400, msg, err);
};

exports.handleError = function(err) {
  // TODO This needs to be fixed.
  // It currently masks the real error AND loses any asyncronous stack trace that may exist.
  if (err) {
    if (err.name === 'ValidationError') {
      return exports.badRequest(null, err);
    } else {
      // A general error (db, crypto, etc…)
      return createError(500, err);
    }
  }
};
