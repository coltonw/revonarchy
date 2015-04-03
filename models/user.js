'use strict';

var temporaryDatabase = {};
var nextId = 0;

exports.getByEmail = function(email) {
  var userId;
  for (userId in temporaryDatabase) {
    if (temporaryDatabase.hasOwnProperty(userId)) {
      if(temporaryDatabase[userId].email === email) {
        return temporaryDatabase[userId];
      }
    }
  }
  return null;
};

exports.get = function(id) {
  return temporaryDatabase[id];
};

exports.insert = function(user) {
  var existingUser = exports.getByEmail(user.email);
  if(existingUser) {
    return existingUser;
  } else {
    user.id = nextId;
    temporaryDatabase[nextId] = user;
    nextId++;
    return user;
  }
};
