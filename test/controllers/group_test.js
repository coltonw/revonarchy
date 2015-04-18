var config = require('../../config');
var request = require('supertest');
var should = require('should');
var co = require('co');
var app = require('../../app');

var QueueValue = require('../../models/queueValue');
var Group = require('../../models/group');

var utils = require('../utils');

function setupGroup(emailAddresses) {
  var userPromises = [];
  var i;
  var usersArray = [];
  var groupId;

  for (i = 0; i < emailAddresses.length; i++) {
    userPromises.push(utils.testPost('/user', {user:{email:emailAddresses[i]}}));
  }
  return Promise.all(userPromises).then(function(usersResults) {
    for (i = 0; i < usersResults.length; i++) {
      usersArray.push(usersResults[i].user);
    }
    return QueueValue.create(usersArray[0]._id);
  }).then(function(queueValue) {
    groupId = queueValue.groupId;
    var queueValuePromises = [];
    for (i = 1; i < usersArray.length; i++) {
      queueValuePromises.push(QueueValue.create(usersArray[i]._id, groupId));
    }
    return Promise.all(queueValuePromises);
  }).then(function(queueValues) {
    return co(Group.create(groupId, usersArray[0]._id));
  }).then(function(group) {
    return Promise.resolve({
      group: group,
      users: usersArray
    });
  });
}

describe('group controller', function() {
  it('should return a group with the revonarch after revonarch is called at least once', function(done) {
    var emailAddress1 = 'coltonw@gmail.com';
    var emailAddress2 = 'coltonw[thistimewithfeeling]@gmail.com';
    var usersArray = [];
    var revonarch1;

    try {
      Promise.all([
        utils.testPost('/user', {user:{email:emailAddress1}}),
        utils.testPost('/user', {user:{email:emailAddress2}})
      ]).then(function(usersResults) {
        var i;
        for (i = 0; i < usersResults.length; i++) {
          usersArray.push(usersResults[i].user);
        }
        return utils.testPost('/group', {users:usersArray});
      }).then(function(groupResults) {
        return utils.testPost('/revonarch', {users:usersArray, group: groupResults.group});
      }).then(function(revonarchResult) {
        revonarchResult.should.have.property('revonarch');
        revonarch1 = revonarchResult.revonarch;
        revonarch1.should.have.property('_id');
        usersArray.should.matchAny(revonarch1);
        return utils.testPost('/group', {users:usersArray});
      }).then(function(groupResults) {
        groupResults.group.revonarchId.should.equal(revonarch1._id);
        done();
      }).catch(function(e) {
        e = e || new Error('Promise had a rejection with no error');
        done(e);
      });
    } catch (e) {
      done(e);
    }
  });

  it('should return the smallest group when the users are part of multiple groups', function(done) {
    var emailAddress1 = 'coltonw@gmail.com';
    var emailAddress2 = 'coltonw[thistimewithfeeling]@gmail.com';
    var emailAddress3 = 'coltonw[tooManyColtons]@gmail.com';
    var usersArray = [];
    var revonarch1;
    var bigGroupId;
    var smallGroupId;

    try {
      setupGroup([emailAddress1, emailAddress2, emailAddress3]).then(function(groupInfo) {
        bigGroupId = groupInfo.group._id;
        return setupGroup([emailAddress1, emailAddress2]);
      }).then(function(groupInfo) {
        smallGroupId = groupInfo.group._id;
        smallGroupId.should.not.equal(bigGroupId);
        return utils.testPost('/group', {users:groupInfo.users});
      }).then(function(groupResults) {
        groupResults.group._id.should.equal(smallGroupId.toString());
        done();
      }).catch(function(e) {
        e = e || new Error('Promise had a rejection with no error');
        done(e);
      });
    } catch (e) {
      done(e);
    }
  });
});
