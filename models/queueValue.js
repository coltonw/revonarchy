'use strict';

var temporaryDatabase = {};
var nextId = 6000;

exports.listByUser = function(userId) {
  var groupId,
      list = [];
  for (groupId in temporaryDatabase[userId]) {
    if (temporaryDatabase[userId].hasOwnProperty(groupId)) {
      list.push(temporaryDatabase[userId][groupId]);
    }
  }
  return list;
};

exports.listByGroup = function(groupId) {
  var userId,
      list = [];
  for (userId in temporaryDatabase) {
    if (temporaryDatabase.hasOwnProperty(userId) &&
        temporaryDatabase[userId][groupId]) {
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
    nextId++;
  }
  if(!temporaryDatabase[userId]) {
    temporaryDatabase[userId] = {};
  }
  temporaryDatabase[userId][groupId] = {
    userId: userId,
    groupId: groupId,
    queueValue: Math.random()
  };
  return temporaryDatabase[userId][groupId];
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
