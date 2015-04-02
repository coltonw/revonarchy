var config = require('../../config'),
    request = require('supertest'),
    app = require('../../app'),
    should = require('should'),
    blanket = require('blanket')(config.blanket);

function testPost(route, body) {
  return new Promise(function(resolve, reject) {
    request(app)
      .post(route)
      .send(body)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) {
          reject();
        } else {
          resolve(res.body);
        }
      });
  });
}

describe('queue controller', function(){
  it('should return a different user each time it is called', function(done){
    var emailAddress1 = 'coltonw@gmail.com',
        emailAddress2 = 'coltonw[thistimewithfeeling]@gmail.com',
        usersArray, revonarch1;

    Promise.all([
      testPost('/user', {user:{email:emailAddress1}}),
      testPost('/user', {user:{email:emailAddress2}})
    ]).then(function(usersResults){
      usersArray = usersResults;
      return testPost('/revonarch', {users:usersArray});
    }, function(){
      should.fail();
      done();
    }).then(function(revonarchResult){
      revonarch1 = revonarchResult;
      revonarch1.should.have.property('id');
      return testPost('/revonarch', {users:usersArray});
    }, function(){
      should.fail();
      done();
    }).then(function(revonarchResult2){
      revonarchResult2.should.have.property('id');
      revonarchResult2.id.should.not.equal(revonarch1.id);
      done();
    }, function(){
      should.fail();
      done();
    });
  });
});
