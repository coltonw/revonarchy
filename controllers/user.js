'use strict';

/**
 * Module dependencies.
 */

var config = require('../config');

var User = require('../models/user');

exports.create = function *() {
  var user = this.request.body.user;
  this.body = yield User.insert(user);
};

exports.get = function *() {
  var email = this.params.email;
  this.body = yield User.getByEmail(email);
};
