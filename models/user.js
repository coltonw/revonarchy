'use strict';

var User = require('./schemas/user').User;
var temporaryDatabase = {};

exports.getByEmail = function(email) {
  return new Promise(function(resolve, reject) {
    User.findOne({ email: email }, function (err, user) {
      if (err) return reject(err);
      resolve(user);
    });
  });
};

exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    return User.get(id, function(err, user) {
      if (err) return reject(err);
      resolve(user);
    });
  });
};

exports.insert = function(user) {
  return new Promise(function(resolve, reject) {
    exports.getByEmail(user.email).then(function(existingUser) {
      var newUser;
      // ExisitingUser will be null if no document was matched
      if(existingUser) {
        resolve(existingUser);
      } else {
        newUser = new User(user);
        user.save(function(err, newUser) {
          resolve(newUser);
        });
      }
    }, function(err) {
      reject(err);
    });
  });
};
