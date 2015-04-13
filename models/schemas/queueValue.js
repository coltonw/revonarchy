var mongoose = require('mongoose');

exports.queueValueSchema = mongoose.Schema({
    userId: mongoose.Schema.ObjectId,
    groupId: mongoose.Schema.ObjectId,
    queueValue: Number
});

exports.queueValueSchema.index({ userId: 1, groupId: 1 }, { unique: true });

exports.QueueValue = mongoose.model('QueueValue', exports.queueValueSchema);
