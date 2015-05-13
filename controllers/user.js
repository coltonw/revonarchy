'use strict';

/**
 * Module dependencies.
 */

var config = require('../config');

var User = require('../models/user');

exports.create = function *() {
  var user = this.request.body.user;
  var newUser = yield User.upsert(user);
  this.body = {user: newUser};
};

exports.get = function *() {
  var email = this.params.email;
  var user = yield User.getByEmail(email);
  this.body = {user: user};
};
