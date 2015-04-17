'use strict';

/*
* Modified from https://github.com/elliotf/mocha-mongoose
*/

var config = require('../config');
var mongoose = require('mongoose');
var request = require('supertest');
var app = require('../app');

// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
process.env.NODE_ENV = 'test';

beforeEach(function (done) {

  var clearDB = function () {
    for (var i in mongoose.connection.collections) {
      mongoose.connection.collections[i].remove(function() {});
    }
    return done();
  };

  if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.mongoUri, function (err) {
      if (err) {
        throw err;
      }
      return clearDB();
    });
  } else {
    return clearDB();
  }
});

afterEach(function (done) {
  mongoose.disconnect();
  return done();
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
