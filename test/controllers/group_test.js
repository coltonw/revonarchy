var config = require('../../config');
var request = require('supertest');
var should = require('should');
var app = require('../../app');

var utils = require('../utils');

describe('group controller', function() {
  it('should return a group with the revonarch after revonarch is called at least once', function(done) {
    var emailAddress1 = 'coltonw@gmail.com';
    var emailAddress2 = 'coltonw[thistimewithfeeling]@gmail.com';
    var usersArray = [];
    var revonarch1;

    try {
      Promise.all([
        utils.testPost('/user', {user:{email:emailAddress1}}),
        utils.testPost('/user', {user:{email:emailAddress2}})
      ]).then(function(usersResults) {
        var i;
        for (i = 0; i < usersResults.length; i++) {
          usersArray.push(usersResults[i].user);
        }
        return utils.testPost('/group', {users:usersArray});
      }).then(function(groupResults) {
        return utils.testPost('/revonarch', {users:usersArray, group: groupResults.group});
      }).then(function(revonarchResult) {
        revonarchResult.should.have.property('revonarch');
        revonarch1 = revonarchResult.revonarch;
        revonarch1.should.have.property('_id');
        usersArray.should.matchAny(revonarch1);
        return utils.testPost('/group', {users:usersArray});
      }).then(function(groupResults) {
        groupResults.group.revonarchId.should.equal(revonarch1._id);
        done();
      }).catch(function(e) {
        e = e || new Error('Promise had a rejection with no error');
        done(e);
      });
    } catch (e) {
      done(e);
    }
  });
  it('should return a group whenever a group is asked for', function(done) {
    var emailAddress1 = 'coltonw@gmail.com';
    var emailAddress2 = 'coltonw[thistimewithfeeling]@gmail.com';
    var usersArray = [];
    var revonarch1;

    try {
      Promise.all([
        utils.testPost('/user', {user:{email:emailAddress1}}),
        utils.testPost('/user', {user:{email:emailAddress2}})
      ]).then(function(usersResults) {
        var i;
        for (i = 0; i < usersResults.length; i++) {
          usersArray.push(usersResults[i].user);
        }
        return utils.testPost('/group', {users:usersArray});
      }).then(function(groupResults) {
        groupResults.should.not.have.property('group', null);
        groupResults.group.should.have.property('_id');
        done();
      }).catch(function(e) {
        e = e || new Error('Promise had a rejection with no error');
        done(e);
      });
    } catch (e) {
      done(e);
    }
  });

  it('should return the smallest group when the users are part of multiple groups', function(done) {
    var emailAddress1 = 'coltonw@gmail.com';
    var emailAddress2 = 'coltonw[thistimewithfeeling]@gmail.com';
    var emailAddress3 = 'coltonw[tooManyColtons]@gmail.com';
    var bigGroupId;
    var smallGroupId;

    try {
      utils.setupGroup([emailAddress1, emailAddress2, emailAddress3]).then(function(groupInfo) {
        bigGroupId = groupInfo.group._id;
        return utils.setupGroup([emailAddress1, emailAddress2]);
      }).then(function(groupInfo) {
        smallGroupId = groupInfo.group._id;
        smallGroupId.should.not.equal(bigGroupId);
        return utils.testPost('/group', {users: groupInfo.users});
      }).then(function(groupResults) {
        groupResults.group._id.should.equal(smallGroupId.toString());
        done();
      }).catch(function(e) {
        e = e || new Error('Promise had a rejection with no error');
        done(e);
      });
    } catch (e) {
      done(e);
    }
  });

  it('should return the smallest group when the users are part of multiple groups regardless of the order of adding groups', function(done) {
    var emailAddress1 = 'coltonw@gmail.com';
    var emailAddress2 = 'coltonw[thistimewithfeeling]@gmail.com';
    var emailAddress3 = 'coltonw[tooManyColtons]@gmail.com';
    var bigGroupId;
    var smallGroupId;
    var smallGroupUsers;

    try {
      utils.setupGroup([emailAddress1, emailAddress2]).then(function(groupInfo) {
        smallGroupId = groupInfo.group._id;
        smallGroupUsers = groupInfo.users;
        return utils.setupGroup([emailAddress1, emailAddress2, emailAddress3]);
      }).then(function(groupInfo) {
        bigGroupId = groupInfo.group._id;
        bigGroupId.should.not.equal(smallGroupId);
        return utils.testPost('/group', {users: smallGroupUsers});
      }).then(function(groupResults) {
        groupResults.group._id.should.equal(smallGroupId.toString());
        done();
      }).catch(function(e) {
        e = e || new Error('Promise had a rejection with no error');
        done(e);
      });
    } catch (e) {
      done(e);
    }
  });

  it('should return new group when there are fewer matching users than the minimum percent', function(done) {
    var emailAddresses = [
      'coltonw@gmail.com',
      'coltonw[1]@gmail.com',
      'coltonw[2]@gmail.com',
      'coltonw[3]@gmail.com',
      'coltonw[4]@gmail.com',
      'coltonw[5]@gmail.com',
      'coltonw[6]@gmail.com',
      'coltonw[7]@gmail.com',
      'coltonw[8]@gmail.com',
      'coltonw[9]@gmail.com',
      'coltonw[10]@gmail.com',
      'coltonw[11]@gmail.com'
    ];
    var usersArray;
    var previousGroupId;
    var matchingUsers = 3;

    try {
      matchingUsers.should.be.below(emailAddresses.length * config.minGroupPercent);
      utils.setupGroup(emailAddresses.slice(0, matchingUsers)).then(function(groupInfo) {
        previousGroupId = groupInfo.group._id;
        usersArray = groupInfo.users;
        return utils.createUsers(emailAddresses.slice(matchingUsers));
      }).then(function(users) {
        usersArray = usersArray.concat(users);
        usersArray.should.have.property('length', emailAddresses.length);
        return utils.testPost('/group', {users: usersArray});
      }).then(function(groupResults) {
        groupResults.should.not.have.property('group', null);
        groupResults.group.should.have.property('_id');
        groupResults.group.should.not.have.property('_id', previousGroupId.toString());
        done();
      }).catch(function(e) {
        e = e || new Error('Promise had a rejection with no error');
        done(e);
      });
    } catch (e) {
      done(e);
    }
  });

  it('should return matching group when there are more matching users than the minimum percent', function(done) {
    var emailAddresses = [
      'coltonw@gmail.com',
      'coltonw[1]@gmail.com',
      'coltonw[2]@gmail.com',
      'coltonw[3]@gmail.com',
      'coltonw[4]@gmail.com',
      'coltonw[5]@gmail.com',
      'coltonw[6]@gmail.com',
      'coltonw[7]@gmail.com',
      'coltonw[8]@gmail.com',
      'coltonw[9]@gmail.com',
      'coltonw[10]@gmail.com',
      'coltonw[11]@gmail.com'
    ];
    var usersArray;
    var groupId;
    var matchingUsers = 5;

    try {
      matchingUsers.should.be.above(emailAddresses.length * config.minGroupPercent);
      utils.setupGroup(emailAddresses.slice(0, matchingUsers)).then(function(groupInfo) {
        groupId = groupInfo.group._id;
        usersArray = groupInfo.users;
        return utils.createUsers(emailAddresses.slice(matchingUsers));
      }).then(function(users) {
        usersArray = usersArray.concat(users);
        usersArray.should.have.property('length', emailAddresses.length);
        return utils.testPost('/group', {users: usersArray});
      }).then(function(groupResults) {
        groupResults.should.not.have.property('group', null);
        groupResults.group._id.should.equal(groupId.toString());
        done();
      }).catch(function(e) {
        e = e || new Error('Promise had a rejection with no error');
        done(e);
      });
    } catch (e) {
      done(e);
    }
  });

  it('should return null group when given no users', function(done) {
    try {
      utils.testPost('/group', {users: []}).then(function(groupResults) {
        groupResults.should.have.property('group', null);
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
