'use strict';

var User = require('./schemas/user').User;
var db = require('../lib/db');

exports.getByEmail = function(email) {
  return new Promise(function(resolve, reject) {
    User.findOne({ email: email }, function (err, user) {
      if (err) return reject(db.handleError(err));
      resolve(user);
    });
  });
};

exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    return User.findById(id, function(err, user) {
      if (err) return reject(db.handleError(err));
      resolve(user);
    });
  });
};

exports.insert = function(user) {
  return new Promise(function(resolve, reject) {
    if(!user || !user.email) return reject(new Error('User with email address required'));
    exports.getByEmail(user.email).then(function(existingUser) {
      var newUser;
      // ExistingUser will be null if no document was matched
      if(existingUser) {
        resolve(existingUser);
      } else {
        newUser = new User(user);
        newUser.save(function(err, newUser) {
          if(err) return reject(db.handleError(err));
          resolve(newUser);
        });
      }
    }, function(err) {
      reject(db.handleError(err));
    });
  });
};
