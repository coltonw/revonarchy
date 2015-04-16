
var QueueValue = require('../models/queueValue');
var Group = require('../models/group');

// Ties between the most common groups are broken
// by the smallest group being chosen first.
// Behavior is undefined if the groups are the same size.
exports.chooseGroup = function *() {
  var users = this.request.body.users;
  var userHash = {};
  var allQueueValues = {};
  var i;
  var userId;

  for (i = 0; i < users.length; i++) {
    userId = users[i]._id;
    userHash[userId] = users[i];
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
    return yield getSmallestGroup(maxGroup);
  } else if (maxGroupCount >= config.minGroupSize &&
      maxGroupCount / numUsers >= config.minGroupPercent) {
    return yield getSmallestGroup(maxGroup);
  }
  return null;
};

function *getSmallestGroup(groupIds) {
  var smallestGroup;
  var smallestGroupSize = 0;
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
      if (tmpGroupList.length > smallestGroupSize) {
        smallestGroupSize = tmpGroupList.length;
        smallestGroup = groupIds[i];
      }
      return yield Group.updateTotalUsers({
        _id: smallestGroup,
        totalUsers: smallestGroupSize
      });
    }
    return smallestGroup;
  }
}
