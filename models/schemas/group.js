var mongoose = require('mongoose');

exports.groupSchema = mongoose.Schema({
    revonarchId: mongoose.Schema.ObjectId,
    totalUsers: Number
});

exports.Group = mongoose.model('Group', exports.groupSchema);
