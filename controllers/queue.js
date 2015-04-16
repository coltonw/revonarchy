'use strict';

/**
 * Module dependencies.
 */

var config = require('../config');
var path = require('path');
var fs = require('fs');

var User = require('../models/user');
var QueueValue = require('../models/queueValue');
var Group = require('../models/group');

exports.revonarch = function *(group) {
  var users = this.request.body.users;
  var userHash = {};
  var allQueueValues = {};
  var i;
  var userId;
  var revonarch;

  for (i = 0; i < users.length; i++) {
    userId = users[i]._id;
    userHash[userId] = users[i];
    allQueueValues[userId] = yield QueueValue.listByUser(userId);
  }

  var groupId = group._id;
  var queueValues = [];
  var tmpQueueValue;
  var foundQueueValue;

  for (userId in allQueueValues) {
    if (allQueueValues.hasOwnProperty(userId)) {
      foundQueueValue = false;
      for (i = 0; i < allQueueValues[userId].length; i++) {
        tmpQueueValue = allQueueValues[userId][i];
        if (tmpQueueValue.groupId.equals(groupId)) {
          queueValues.push(tmpQueueValue);
          foundQueueValue = true;
          break;
        }
      }
      if (!foundQueueValue) {
        tmpQueueValue = yield QueueValue.create(userId, groupId);
        queueValues.push(tmpQueueValue);

        // In the case that the groupId was null, we need to reset the groupId
        // based on the newly generated one.
        groupId = tmpQueueValue.groupId;
      }
    }
  }

  // Sort queue values from lowest to highest
  queueValues.sort(function(a, b) {
    if (a.queueValue < b.queueValue) {
      return -1;
    }
    if (a.queueValue > b.queueValue) {
      return 1;
    }
    return 0;
  });

  var tmpValue;

  revonarch = userHash[queueValues[0].userId];
  group.revonarch = revonarch;
  yield Group.updateRevonarch(group);
  tmpValue = queueValues[queueValues.length - 1].queueValue;
  for (i = queueValues.length - 1; i > 0; i--) {
    queueValues[i].queueValue = queueValues[i - 1].queueValue;
    yield QueueValue.update(queueValues[i]);
  }
  queueValues[0].queueValue = tmpValue;
  yield QueueValue.update(queueValues[0]);

  // All hail the new Revonarch!
  this.body = revonarch;

  // HAIL!
};
