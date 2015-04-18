'use strict';

var ObjectId = require('mongoose').Types.ObjectId;

exports.castId = function(mongooseJson) {
  if (typeof mongooseJson === 'string') {
    return new ObjectId(mongooseJson);
  } if (mongooseJson && mongooseJson._id) {
    if (!(mongooseJson._id instanceof ObjectId)) {
      mongooseJson._id = new ObjectId(mongooseJson._id);
    }
  }
  return mongooseJson;
};

exports.castIds = function(mongooseJson) {
  var i;
  if (!Array.isArray(mongooseJson)) {
    return exports.castId(mongooseJson);
  }
  for (i = 0; i < mongooseJson.length; i++) {
    mongooseJson[i] = exports.castId(mongooseJson[i]);
  }
  return mongooseJson;
};
