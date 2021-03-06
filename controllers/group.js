'use strict';

/**
 * Module dependencies.
 */

var config = require('../config');
var R = require('ramda');

var QueueValue = require('../models/queueValue');
var Group = require('../models/group');

var converter = require('../lib/mongooseHelpers');

// Ties between the most common groups are broken
// by the smallest group being chosen first.
// Behavior is undefined if the groups are the same size.
exports.chooseGroup = function *(users, createOnNull) {
  var allQueueValues = {};
  var i;
  var userId;

  for (i = 0; i < users.length; i++) {
    userId = users[i]._id;
    allQueueValues[userId] = yield QueueValue.listByUser(userId);
  }

  var groups = {};
  var tmpGroupId;
  var maxGroup = [];
  var maxGroupCount = 0;
  var numUsers = 0;

  for (userId in allQueueValues) {
    if (allQueueValues.hasOwnProperty(userId)) {
      for (i = 0; i < allQueueValues[userId].length; i++) {
        tmpGroupId = allQueueValues[userId][i].groupId;
        if (!groups[tmpGroupId]) {
          groups[tmpGroupId] = [allQueueValues[userId][i]];
        } else {
          groups[tmpGroupId].push(allQueueValues[userId][i]);
        }
        if (groups[tmpGroupId].length > maxGroupCount) {
          maxGroupCount = groups[tmpGroupId].length;
          maxGroup = [tmpGroupId];
        } else if (groups[tmpGroupId].length === maxGroupCount) {
          maxGroup.push(tmpGroupId);
        }
      }
      numUsers++;
    }
  }

  var smallestGroup, completeQueueValues;

  if (numUsers === maxGroupCount) {
    smallestGroup = yield getSmallestGroup(maxGroup);
    if (smallestGroup) {
      completeQueueValues = yield createMissingQueueValues(smallestGroup._id, users, groups[smallestGroup._id.toString()]);
      smallestGroup.queueValues = completeQueueValues;
    }
    return smallestGroup;
  } else if (maxGroupCount >= config.minGroupSize &&
      maxGroupCount / numUsers >= config.minGroupPercent) {
    smallestGroup = yield getSmallestGroup(maxGroup);
    completeQueueValues = yield createMissingQueueValues(smallestGroup._id, users, groups[smallestGroup._id.toString()]);
    smallestGroup.queueValues = completeQueueValues;
    return smallestGroup;
  } else if (createOnNull) {

    // Create a new group because no existing group matches
    var tmpQueueValue;
    var groupId = null;

    completeQueueValues = [];
    for (i = 0; i < users.length; i++) {
      userId = users[i]._id;
      tmpQueueValue = yield QueueValue.create(userId, groupId);
      completeQueueValues.push(tmpQueueValue);

      // In the case that the groupId was null, we need to reset the groupId
      // based on the newly generated one.
      groupId = tmpQueueValue.groupId;
    }
    smallestGroup = yield Group.create(groupId);
    smallestGroup.queueValues = completeQueueValues;
    return smallestGroup;
  }

};

exports.chooseGroupRoute = function *() {
  var users = converter.castIds(this.request.body.users);
  var group = yield exports.chooseGroup(users, true);

  // You need to wrap the response in case its null,
  // since it still needs to be JSON.
  this.body = {
    group: group,
    queueValues: (group ? group.queueValues : undefined)
  };
};

function *getSmallestGroup(groupIds) {
  var smallestGroup;
  var smallestGroupSize = Number.MAX_SAFE_INTEGER;
  var i;
  var tmpGroupList;
  if (groupIds.length < 1) {
    return null;
  } else if (groupIds.length === 1) {
    return yield Group.get(groupIds[0]);
  } else {
    smallestGroup = null;
    for (i = 0; i < groupIds.length; i++) {
      tmpGroupList = yield QueueValue.listByGroup(groupIds[i]);
      if (tmpGroupList.length < smallestGroupSize) {
        smallestGroupSize = tmpGroupList.length;
        smallestGroup = groupIds[i];
      }
    }
    return yield Group.updateTotalUsers({
      _id: smallestGroup,
      totalUsers: smallestGroupSize
    });
  }
}

function *createMissingQueueValues(groupId, users, currentQueueValues) {
  var i;
  var j;
  var findMatch;
  var noMatch;
  var tmpQueueValue;
  var currentUserIdStrings = R.map(function(qv) {return qv.userId.toString();}, currentQueueValues);
  for (i = 0; i < users.length; i++) {
    findMatch = R.find(R.identical(users[i]._id.toString()));
    noMatch = R.pipe(findMatch, R.isNil);
    if (noMatch(currentUserIdStrings)) {
      tmpQueueValue = yield QueueValue.create(users[i]._id, groupId);
      currentQueueValues.push(tmpQueueValue);
    }
  }
  return currentQueueValues;
}
