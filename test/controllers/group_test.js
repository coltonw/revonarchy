var config = require('../../config');
var request = require('supertest');
var should = require('should');
var app = require('../../app');

var utils = require('../utils');

describe('group controller', function() {
  it('should return a group with the revonarch after revonarch is called at least once', function(done) {
    var emailAddress1 = 'coltonw@gmail.com';
    var emailAddress2 = 'coltonw[thistimewithfeeling]@gmail.com';
    var usersArray;
    var revonarch1;

    try {
      Promise.all([
        utils.testPost('/user', {user:{email:emailAddress1}}),
        utils.testPost('/user', {user:{email:emailAddress2}})
      ]).then(function(usersResults) {
        usersArray = usersResults;
        return utils.testPost('/group', {users:usersArray});
      }).then(function(groupResults) {
        return utils.testPost('/revonarch', {users:usersArray, group: groupResults.group});
      }).then(function(revonarchResult) {
        revonarch1 = revonarchResult;
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
    } catch(e) {
      done(e);
    }
  });
});
