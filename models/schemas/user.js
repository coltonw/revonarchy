var mongoose = require('mongoose');

exports.userSchema = mongoose.Schema({
  email: { type: String, unique: true },
  name: String
}, { safe: {w: 1} });

exports.User = mongoose.model('User', exports.userSchema);
