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

};

exports.get = function(id) {
  return temporaryDatabase[id];
};

exports.insert = function(user) {
  temporaryDatabase[nextId] = user;
  nextId++;
};
