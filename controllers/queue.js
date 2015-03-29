'use strict';

/**
 * Module dependencies.
 */

var config = require('../config');
var path = require('path');
var fs = require('fs');

var User = require('../models/user');
var QueueValue = require('../models/queueValue');

function chooseGroup(queueValues) {
  var groups = {},
      userId;

  for (userId in queueValues) {
    if (queueValues.hasOwnProperty(userId)) {
      // TODO: We want to choose this based on the most shared group
      // or generate a new group if there is no most shared,
      // but just to have this running, return first groupId found
      if (queueValues[userId][0]) {
        return queueValues[userId][0].groupId;
      }
    }
  }
  return null;
}

exports.revonarch = function* () {
  var users = this.request.body.users,
      userHash = {},
      allQueueValues = {},
      i, userId,
      revonarch;

  for (i = 0; i < users.length; i++) {
    userId = users[i].id;
    userHash[userId] = users[i];
    allQueueValues[userId] = QueueValue.listByUser(userId);
  }

  var groupId = chooseGroup(allQueueValues),
      queueValues = [],
      tmpQueueValue,
      foundQueueValue;


  for (userId in allQueueValues) {
    if (allQueueValues.hasOwnProperty(userId)) {
      foundQueueValue = false;
      for (i = 0; i < allQueueValues[userId].length; i++) {
        tmpQueueValue = allQueueValues[userId][i];
        if (tmpQueueValue.groupId === groupId) {
          queueValues.push(tmpQueueValue);
          foundQueueValue = true;
          break;
        }
      }
      if (!foundQueueValue) {
        tmpQueueValue = QueueValue.create(userId, groupId);
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
  tmpValue = queueValues[queueValues.length-1].queueValue;
  for(i = queueValues.length-1; i > 0; i--) {
    queueValues[i].queueValue = queueValues[i-1].queueValue;
    QueueValue.update(queueValues[i]);
  }
  queueValues[0].queueValue = tmpValue;
  QueueValue.update(queueValues[0]);

  // All hail the new Revonarch!
  this.body = revonarch;
  // HAIL!
};
