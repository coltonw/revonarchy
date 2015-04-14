'use strict';

var User = require('./schemas/user').User;

exports.getByEmail = function(email) {
  return User.findOne({ email: email }).exec();
};

exports.get = function(id) {
  return User.findById(id).exec();
};

exports.insert = function *(user) {
  if (!user || !user.email) return new Error('User with email address required');
  var existingUser = yield exports.getByEmail(user.email);
  var newUser;

  // ExistingUser will be null if no document was matched
  if (existingUser) {
    return existingUser;
  } else {
    newUser = new User(user);
    return newUser.save();
  }
};
