'use strict';

/**
 * Module dependencies.
 */

var home = require('./controllers/home');
var queue = require('./controllers/queue');
var user = require('./controllers/user');

module.exports = function routes(app) {
  app.get('/', home);

  app.get('/user/email/:email', user.get);
  app.post('/user', user.create);

  app.post('/revonarch', queue.revonarch);
};
