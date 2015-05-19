'use strict';

/**
 * Module dependencies.
 */

var config = require('../config');

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

  var smallestGroup;

  if (numUsers === maxGroupCount) {
    smallestGroup = yield getSmallestGroup(maxGroup);
    if (smallestGroup) {
      yield createMissingQueueValues(smallestGroup._id, users, groups[smallestGroup._id.toString()]);
    }
    return smallestGroup;
  } else if (maxGroupCount >= config.minGroupSize &&
      maxGroupCount / numUsers >= config.minGroupPercent) {
    smallestGroup = yield getSmallestGroup(maxGroup);
    yield createMissingQueueValues(smallestGroup._id, users, groups[smallestGroup._id.toString()]);
    return smallestGroup;
  } else if (createOnNull) {

    // Create a new group because no existing group matches
    var tmpQueueValue;
    var groupId = null;
    for (i = 0; i < users.length; i++) {
      userId = users[i]._id;
      tmpQueueValue = yield QueueValue.create(userId, groupId);

      // In the case that the groupId was null, we need to reset the groupId
      // based on the newly generated one.
      groupId = tmpQueueValue.groupId;
    }
    return yield Group.create(groupId);
  }

};

exports.chooseGroupRoute = function *() {
  var users = converter.castIds(this.request.body.users);
  var group = yield exports.chooseGroup(users, true);

  // You need to wrap the response in case its null,
  // since it still needs to be JSON.
  this.body = {
    group: group
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
  var i, j, found;
  for (i = 0; i < users.length; i++) {
    found = false;
    for (j = 0; j < currentQueueValues.length; j++) {
      if (users[i]._id.toString() === currentQueueValues[j].userId.toString()) {
        found = true;
        break;
      }
    }
    if (!found) {
      yield QueueValue.create(users[i]._id, groupId);
    }
  }

}
