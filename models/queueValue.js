'use strict';

var QueueValue = require('./schemas/queueValue').QueueValue,
    ObjectId = require('mongoose').Types.ObjectId;

exports.listByUser = function(userId) {
  return QueueValue.find({ userId: userId }).exec();
};

exports.listByGroup = function(groupId) {
  return QueueValue.find({ groupId: groupId }).exec();
};

exports.get = function(userId, groupId) {
  return QueueValue.findOne({ userId: userId, groupId: groupId }).exec();
};

exports.create = function(userId, groupId) {
  if(!groupId) {
    groupId = new ObjectId();
  }
  var newQueueValue = new QueueValue({
    userId: userId,
    groupId: groupId,
    queueValue: Math.random()
  });
  return newQueueValue.save();
};

// Update only allows you to update the queueValue.queueValue.
exports.update = function(queueValue) {
  return QueueValue.findByIdAndUpdate(queueValue._id, {queueValue: queueValue.queueValue}).exec();
};
