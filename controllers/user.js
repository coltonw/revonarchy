'use strict';

/**
 * Module dependencies.
 */

var config = require('../config');
var path = require('path');
var fs = require('fs');

var User = require('../models/user');

exports.create = function* () {
  var user = this.request.body.user;
  this.body = User.insert(user);
};

exports.get = function* () {
  var email = this.params.email;
  this.body = User.getByEmail(email);
};
