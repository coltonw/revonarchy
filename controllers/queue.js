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
      return queueValues[userId].groupId;
    }
  }
}

exports.revonarch = function* () {
  var users = this.request.body.users,
      allQueueValues = {},
      i, userId,
      // TODO: Remove this silliness :)
      revonarch = "Will Colton";

  for(i = 0; i < users.length; i++) {
    userId = users[i].id;
    allQueueValues[userId] = QueueValue.listByUser(userId);
  }

  var groupId = chooseGroup(allQueueValues),
      queueValues;

  // TODO: Create queue value for all users not in the chosen group

  // TODO: Get Revonarch and rotate all queue values and save them

  // All hail the new Revonarch!
  this.body = revonarch;
  // HAIL!
};
