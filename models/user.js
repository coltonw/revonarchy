'use strict';

var User = require('./schemas/user').User;

exports.getByEmail = function(email) {
  return User.findOne({ email: email }).exec();
};

exports.get = function(id) {
  return User.findById(id).exec();
};

exports.upsert = function *(user) {
  if (!user || !user.email) return new Error('User with email address required');
  delete user._id;
  return User.findOneAndUpdate({email: user.email}, user, {new: true, upsert: true}).exec();
};
