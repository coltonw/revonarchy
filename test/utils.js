'use strict';

/*
* Modified from https://github.com/elliotf/mocha-mongoose
*/

var config = require('../config');
var mongoose = require('mongoose');
var request = require('supertest');
var app = require('../app');
var co = require('co');

var QueueValue = require('../models/queueValue');
var Group = require('../models/group');

beforeEach(function (done) {

  var clearDB = function () {
    var collId;
    var dropPromises = [];

    var dropCollection = function(collection) {
      return new Promise(function(resolve, reject) {
        collection.drop(function(err) {
          // test should move on, ignore the errors here for now
          resolve();
        });
      });
    };

    for (collId in mongoose.connection.collections) {
      dropPromises.push(dropCollection(mongoose.connection.collections[collId]));
    }
    return Promise.all(dropPromises).then(function() {
      done();
    });
  };

  if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.mongoUri, function(err) {
      if (err) {
        throw err;
      }
      clearDB();
    });
  } else {
    clearDB();
  }
});

exports.testPost = function(route, body) {
  return new Promise(function(resolve, reject) {
    request(app)
      .post(route)
      .send(body)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          reject();
        } else {
          resolve(res.body);
        }
      });
  });
};

exports.createUsers = function(emailAddresses) {
  var userPromises = [];
  var i;
  var usersArray = [];

  for (i = 0; i < emailAddresses.length; i++) {
    userPromises.push(exports.testPost('/user', {user:{email:emailAddresses[i]}}));
  }
  return Promise.all(userPromises).then(function(usersResults) {
    for (i = 0; i < usersResults.length; i++) {
      usersArray.push(usersResults[i].user);
    }
    return Promise.resolve(usersArray);
  });
};

exports.setupGroup = function(emailAddresses) {
  var i;
  var usersArray = [];
  var groupId;

  return exports.createUsers(emailAddresses).then(function(users) {
    usersArray = users;
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
};
