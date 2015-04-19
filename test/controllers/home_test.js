var config = require('../../config');
var request = require('supertest');
var should = require('should');
var app = require('../../app');

require('../utils');

describe('home controller', function() {
  it('should return a view on going to the root directory', function(done) {
    var emailAddress = 'coltonw@gmail.com';
    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});
