var config = require('../../config');
var request = require('supertest');
var should = require('should');
var app = require('../../app');

var utils = require('../utils');

describe('queue controller', function() {
  it('should return a different user each time it is called', function(done) {
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
        revonarchResult.revonarch.should.have.property('_id');
        revonarch1 = revonarchResult.revonarch;
        usersArray.should.matchAny(revonarch1);
        return utils.testPost('/group', {users:usersArray});
      }).then(function(groupResults) {
        return utils.testPost('/revonarch', {users:usersArray, group: groupResults.group});
      }).then(function(revonarchResult2) {
        revonarchResult2.should.have.property('revonarch');
        revonarchResult2.revonarch.should.have.property('_id');
        revonarchResult2.revonarch._id.should.not.equal(revonarch1._id);
        usersArray.should.matchAny(revonarchResult2.revonarch);
        done();
      }).catch(function(e) {
        e = e || new Error('Promise had a rejection with no error');
        done(e);
      });
    } catch (e) {
      done(e);
    }
  });

  it('should throw an error if the call is made twice in a row', function(done) {
    var emailAddresses = [
      'coltonw@gmail.com',
      'coltonw[thistimewithfeeling]@gmail.com'
    ];
    var groupInfo;
    var revonarchFirstTime;

    try {
      utils.setupGroup(emailAddresses).then(function(info) {
        groupInfo = info;
        return utils.testPost('/revonarch', {users: groupInfo.users, group: groupInfo.group});
      }).then(function(revonarchResult) {
        revonarchResult.should.have.property('revonarch');
        revonarchResult.revonarch.should.have.property('_id');
        revonarchFirstTime = revonarchResult.revonarch;
        return utils.testPostFailure('/revonarch', {users: groupInfo.users, group: groupInfo.group}, 500);
      }).then(function(revonarchResult2) {
        // testPostFailure checks the status, nothing to test here.
        done();
      }).catch(function(e) {
        // While we want an "error" this is if there is an error in our test
        // AKA a test failure
        e = e || new Error('Promise had a rejection with no error');
        done(e);
      });
    } catch (e) {
      done(e);
    }
  });
});
