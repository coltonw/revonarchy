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
  var i;
  var userId;
  var groupId;
  var revonarch;

  // Behavior we want is that submitting an old group result does not change anything,
  // it just throws an error

  if (!groupReq || !groupReq._id) {
    throw new Error('Must include an existing group.');
  } else {
    groupId = groupReq._id;
  }

  if (groupReq && expectedGroup && !groupReq._id.equals(expectedGroup._id)) {
    throw new Error('Group does not match expected group.');
  }

  var queueValues = [];
  var tmpQueueValue;

  // Get queue values for all users, or null for users new to the chosen group.
  for (i = 0; i < users.length; i++) {
    // We don't want to use an ObjectId as a key in a map
    userId = users[i]._id.toString();
    userHash[userId] = users[i];
    if (groupId) {
      tmpQueueValue = yield QueueValue.get(userId, groupId);
      queueValues.push(tmpQueueValue);
    } else {
      throw new Error('Missing queue value!');
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
  groupReq.revonarchId = revonarch._id;
  tmpValue = yield Group.updateRevonarch(groupReq);
  if (tmpValue === null) {
    // If setting the Revonarch fails, we throw an error
    throw new Error('Group does not match expected group.');
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
