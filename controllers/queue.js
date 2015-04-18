'use strict';

/**
 * Module dependencies.
 */

var config = require('../config');

var User = require('../models/user');
var QueueValue = require('../models/queueValue');
var Group = require('../models/group');

var groupController = require('./group');
var converter = require('../lib/mongooseHelpers');

exports.revonarch = function *() {
  var users = converter.castIds(this.request.body.users);
  var groupReq = converter.castIds(this.request.body.group);
  var expectedGroup = yield groupController.chooseGroup(users);
  var userHash = {};
  var existingQueueValues = {};
  var i;
  var userId;
  var groupId = groupReq ? groupReq._id : null;
  var revonarch;

  if ((groupReq !== null && expectedGroup !== null && !groupReq._id.equals(expectedGroup._id)) &&
      (groupReq !== null ||  expectedGroup !== null)) {
    throw new Error('Group does not match expected group.');
  }

  // Get queue values for all users, or null for users new to the chosen group.
  for (i = 0; i < users.length; i++) {
    // We don't want to user an ObjectId as a key in a map
    userId = users[i]._id.toString();
    userHash[userId] = users[i];
    if (groupId) {
      existingQueueValues[userId] = yield QueueValue.get(userId, groupId);
    } else {
      existingQueueValues[userId] = null;
    }
  }

  var queueValues = [];
  var tmpQueueValue;
  var foundQueueValue;

  // Creating new queue values for users new to the chosen group.
  for (userId in existingQueueValues) {
    if (existingQueueValues.hasOwnProperty(userId)) {
      if (existingQueueValues[userId] !== null) {
        queueValues.push(existingQueueValues[userId]);
      } else {
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
  if (groupReq) {
    groupReq.revonarch = revonarch._id;
    tmpValue = yield Group.updateRevonarch(groupReq);
  } else {
    tmpValue = yield Group.create(groupId, revonarch._id);
  }
  tmpValue = queueValues[queueValues.length - 1].queueValue;
  for (i = queueValues.length - 1; i > 0; i--) {
    queueValues[i].queueValue = queueValues[i - 1].queueValue;
    yield QueueValue.update(queueValues[i]);
  }
  queueValues[0].queueValue = tmpValue;
  yield QueueValue.update(queueValues[0]);

  // All hail the new Revonarch!
  this.body = {revonarch: revonarch};

  // HAIL!
};
