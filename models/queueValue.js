'use strict';

var temporaryDatabase = {};
var nextId = 0;

exports.listByUser = function(userId) {
  var groupId,
      list = [];
  for (groupId in temporaryDatabase[userId]) {
    if (temporaryDatabase.hasOwnProperty(groupId)) {
      list.push(temporaryDatabase[userId][groupId]);
    }
  }
  return list;
};

exports.get = function(userId, groupId) {
  if(temporaryDatabase[userId]) {
    return temporaryDatabase[userId][groupId];
  } else {
    return null;
  }
};

exports.insert = function(user) {
  temporaryDatabase[nextId] = user;
  nextId++;
};
