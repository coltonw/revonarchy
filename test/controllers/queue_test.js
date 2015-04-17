var config = require('../../config');
var request = require('supertest');
var should = require('should');
var app = require('../../app');

require('../utils');

function testPost(route, body) {
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
}

describe('queue controller', function() {
  it('should return a different user each time it is called', function(done) {
    var emailAddress1 = 'coltonw@gmail.com';
    var emailAddress2 = 'coltonw[thistimewithfeeling]@gmail.com';
    var usersArray;
    var revonarch1;

    try {
      Promise.all([
        testPost('/user', {user:{email:emailAddress1}}),
        testPost('/user', {user:{email:emailAddress2}})
      ]).then(function(usersResults) {
        usersArray = usersResults;
        return testPost('/group', {users:usersArray});
      }).then(function(groupResults) {
        return testPost('/revonarch', {users:usersArray, group: groupResults.group});
      }).then(function(revonarchResult) {
        revonarch1 = revonarchResult;
        revonarch1.should.have.property('_id');
        usersArray.should.matchAny(revonarch1);
        return testPost('/group', {users:usersArray});
      }).then(function(groupResults) {
        return testPost('/revonarch', {users:usersArray, group: groupResults.group});
      }).then(function(revonarchResult2) {
        revonarchResult2.should.have.property('_id');
        revonarchResult2._id.should.not.equal(revonarch1._id);
        usersArray.should.matchAny(revonarchResult2);
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
