const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

userSchema.index({ "username": 1 }, { unique: true });
module.exports = mongoose.model('User', userSchema);