var mongoose = require('mongoose');

exports.userSchema = mongoose.Schema({
    email: { type: String, unique: true },
    name: String
});

exports.User = mongoose.model('User', exports.userSchema);
