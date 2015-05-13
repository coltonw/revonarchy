var config = require('../../config');
var request = require('supertest');
var should = require('should');
var app = require('../../app');
var co = require('co');

var userController = require('../../controllers/user');

var utils = require('../utils');

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
          var fakeReq = {
            params: {
              email: emailAddress
            }
          };
          co.call(fakeReq, userController.get).then(function(result) {
            fakeReq.body.should.have.property('user');
            fakeReq.body.user.should.have.property('email', emailAddress);
            fakeReq.body.user.should.have.property('_id');
            // Since we made the call directly instead of through the router
            // the _id returned is an ObjectId rather than a string
            fakeReq.body.user._id.toString().should.equal(genId);
            done();
          }).catch(function(e) {
            e = e || new Error('Promise had a rejection with no error');
            done(e);
          });
        }, 1);
      });
  });

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

  it('should upsert on creating a user', function(done) {
    var emailAddress = 'coltonw+upserted@gmail.com';
    var name1 = 'Will Colton';
    var name2 = 'Will Colton 2';
    var userId;

    try {
      utils.testPost('/user', {user:{email:emailAddress, name:name1}}).then(function(userResult) {
        userResult.should.have.property('user');
        userResult.user.should.have.property('_id');
        userResult.user.should.have.property('email', emailAddress);
        userResult.user.should.have.property('name', name1);
        userId = userResult.user._id;
        return utils.testPost('/user', {user:{email:emailAddress, name:name2}});
      }).then(function(userResult) {
        userResult.user.should.have.property('_id', userId);
        userResult.user.should.have.property('email', emailAddress);
        userResult.user.should.have.property('name', name2);
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
