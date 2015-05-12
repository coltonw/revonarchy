'use strict';

var Group = require('./schemas/group').Group;
var QueueValueModel = require('./queueValue');

exports.get = function(id) {
  return Group.findById(id).exec();
};

// Creation only works if no group has been created for these queue values
// TODO Prevent creation if a similar enough group exists?
exports.create = function *(groupId, revonarchId) {
  var queueValues = yield QueueValueModel.listByGroup(groupId);
  var newGroup = new Group({
    _id: groupId,
    revonarchId: revonarchId,
    totalUsers: queueValues.length
  });
  return newGroup.save();
};

// For internal use. May be used later to optimize getSmallestGroup
exports.updateTotalUsers = function(group) {
  return Group.findOneAndUpdate({_id: group._id}, {totalUsers: group.totalUsers}, {new: true}).exec();
};

// Update only works if the current version is found and is updated with an incremented version
exports.updateRevonarch = function(group) {
  var previousVersion = group.__v;
  group.__v = group.__v + 1;
  return Group.findOneAndUpdate({_id: group._id, __v: previousVersion},
      {revonarch: group.revonarch, __v: group.__v}, {new: true}).exec();
};
