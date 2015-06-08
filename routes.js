'use strict';

/**
 * Module dependencies.
 */

var home = require('./controllers/home');
var queue = require('./controllers/queue');
var user = require('./controllers/user');
var group = require('./controllers/group');

module.exports = function routes(router) {
  router.get('/', home);

  router.post('/user', user.create);

  router.post('/group', group.chooseGroupRoute);

  router.post('/revonarch', queue.revonarch);
};
