var config = require('../../config');
var request = require('supertest');
var should = require('should');
var app = require('../../app');
var co = require('co');

var User = require('../../models/user');

var utils = require('../utils');

describe('user model', function() {
  it('should create a user and then get the user by id', function(done) {
    var bobId;
    try {
      co(User.upsert({email: 'bobLobLaw@gmail.com'})).then(function(userResult) {
        userResult.should.have.property('_id');
        bobId = userResult._id;
        return User.get(bobId);
      }).then(function(userResult) {
        userResult.should.have.property('_id');
        userResult.should.have.property('_id', bobId);
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
