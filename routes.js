'use strict';

/**
 * Module dependencies.
 */

var home = require('./controllers/home');
var queue = require('./controllers/queue');
var user = require('./controllers/user');
var group = require('./controllers/group');

module.exports = function routes(app) {
  app.get('/', home);

  app.post('/user', user.create);

  app.post('/group', group.chooseGroupRoute);

  app.post('/revonarch', queue.revonarch);
};
