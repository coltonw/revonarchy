'use strict';

var QueueValue = require('./schemas/queueValue').QueueValue,
    db = require('../lib/db'),
    ObjectId = require('mongoose').Types.ObjectId;

exports.listByUser = function(userId) {
  return new Promise(function(resolve, reject) {
    QueueValue.find({ userId: userId }, function (err, docs) {
      if (err) return reject(db.handleError(err));
      resolve(docs);
    });
  });
};

exports.listByGroup = function(groupId) {
  return new Promise(function(resolve, reject) {
    QueueValue.find({ groupId: groupId }, function (err, docs) {
      if (err) return reject(db.handleError(err));
      resolve(docs);
    });
  });
};

exports.get = function(userId, groupId) {
  return new Promise(function(resolve, reject) {
    QueueValue.findOne({ userId: userId, groupId: groupId }, function (err, docs) {
      if (err) return reject(db.handleError(err));
      resolve(docs);
    });
  });
};

exports.create = function(userId, groupId) {
  return new Promise(function(resolve, reject) {
    if(!groupId) {
      groupId = new ObjectId();
    }
    var newQueueValue = new QueueValue({
      userId: userId,
      groupId: groupId,
      queueValue: Math.random()
    });
    newQueueValue.save(function(err, queueValue) {
      if(err) return reject(db.handleError(err));
      resolve(queueValue);
    });
  });
};

// Update only allows you to update the queueValue.queueValue.
exports.update = function(queueValue) {
  return new Promise(function(resolve, reject) {
    QueueValue.findByIdAndUpdate(queueValue._id, {queueValue: queueValue.queueValue}, function (err, foundQueueValue) {
      if (err) return reject(db.handleError(err));
      resolve(foundQueueValue);
    });
  });
};
