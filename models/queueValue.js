'use strict';

var temporaryDatabase = {};
var nextId = 6000;

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

exports.create = function(userId, groupId) {
  if(!groupId) {
    groupId = nextId;
  }
  temporaryDatabase[userId] = {
    userId: userId,
    groupId: groupId,
    queueValue: Math.random()
  };
  nextId++;
};

exports.update = function(queueValue) {
  var userId = queueValue.userId,
      groupId = queueValue.groupId;

  if(temporaryDatabase[userId] && temporaryDatabase[userId][groupId]) {
    temporaryDatabase[userId][groupId] = queueValue;
  } else {
    throw new Error('No such queueValue');
  }
};
