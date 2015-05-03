'use strict';

/*
* Modified from https://github.com/elliotf/mocha-mongoose
*/

var config = require('../config');
var mongoose = require('mongoose');
var request = require('supertest');
var app = require('../app');

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

exports.testPost = function (route, body) {
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
