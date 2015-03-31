'use strict';

/**
 * Module dependencies.
 */

var config = require('../config');
var path = require('path');
var fs = require('fs');

var User = require('../models/user');
var QueueValue = require('../models/queueValue');

// Ties between the most common groups are broken
// by the smallest group being chosen first.
// Behavior is undefined if the groups are the same size.
function chooseGroup(queueValues) {
  var groups = {},
      userId,
      i,
      tmpGroupId,
      maxGroup = [],
      maxGroupCount = 0,
      numUsers = 0;

  for (userId in queueValues) {
    if (queueValues.hasOwnProperty(userId)) {
      for (i = 0; i < queueValues[userId].length; i++) {
        tmpGroupId = queueValues[userId][i].groupId;
        if (!groups[tmpGroupId]) {
          groups[tmpGroupId] = 1;
        } else {
          groups[tmpGroupId]++;
        }
        if (groups[tmpGroupId] > maxGroupCount) {
          maxGroupCount = groups[tmpGroupId];
          maxGroup = [tmpGroupId];
        } else if (groups[tmpGroupId] === maxGroupCount) {
          maxGroup.push(tmpGroupId);
        }
      }
      numUsers++;
    }
  }

  if (numUsers === maxGroupCount) {
    return getSmallestGroup(maxGroup);
  } else if (maxGroupCount >= config.minGroupSize &&
      maxGroupCount / numUsers >= config.minGroupPercent) {
    return getSmallestGroup(maxGroup);
  }
  return null;
}

function getSmallestGroup(groupIds) {
  var smallestGroup,
      smallestGroupSize = 0,
      i,
      tmpGroupList;
  if (groupIds.length < 1) {
    return null;
  } else if (groupIds.length === 1) {
    return groupIds[0];
  } else {
    smallestGroup = null;
    for (i = 0; i < groupIds.length; i++) {
      tmpGroupList = QueueValue.listByGroup(groupIds[i]);
      if (tmpGroupList.length > smallestGroupSize) {
        smallestGroupSize = tmpGroupList.length;
        smallestGroup = groupIds[i];
      }
    }
    return smallestGroup;
  }
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
