var config = require('../../config'),
    request = require('supertest'),
    app = require('../../app'),
    should = require('should'),
    blanket = require('blanket')(config.blanket);

describe('user controller', function(){
  it('should create a user and return a user with an id', function(done){
    var emailAddress = 'coltonw@gmail.com';
    request(app)
      .post('/user')
      .send({user:{email:emailAddress}})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        var genId = null;
        res.body.should.have.property('id');
        genId = res.body.id;
        // Connection is refused if we do another request within the response
        // so a timeout is needed
        setTimeout(function() {
          request(app)
            .get('/user/email/' + emailAddress)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              res.body.should.have.property('email', emailAddress);
              res.body.should.have.property('id', genId);
              done();
            });
        }, 1);
      });
  });
});
