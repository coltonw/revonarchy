var config = require('../../config');
var request = require('supertest');
var should = require('should');
var app = require('../../app');

require('../utils');

describe('user controller', function() {
  it('should create a user and then get the user by email', function(done) {
    var emailAddress = 'coltonw@gmail.com';
    request(app)
      .post('/user')
      .send({user:{email:emailAddress}})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        var genId = null;
        res.body.should.have.property('user');
        res.body.user.should.have.property('_id');
        genId = res.body.user._id;

        // Connection is refused if we do another request within the response
        // so a timeout is needed
        setTimeout(function() {
          request(app)
            .get('/user/email/' + emailAddress)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);
              res.body.should.have.property('user');
              res.body.user.should.have.property('email', emailAddress);
              res.body.user.should.have.property('_id', genId);
              done();
            });
        }, 10);
      });
  });
});

describe('user controller', function() {
  it('should create a user with a name and return that user', function(done) {
    var emailAddress = 'coltonw+withname@gmail.com';
    var name = 'Will Colton';
    request(app)
      .post('/user')
      .send({user:{email:emailAddress, name:name}})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        var genId = null;
        res.body.should.have.property('user');
        res.body.user.should.have.property('_id');
        res.body.user.should.have.property('email', emailAddress);
        res.body.user.should.have.property('name', name);
        genId = res.body.user._id;
        done();
      });
  });
});
