const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {type: String, required: true},
  lId: {type: String, required: true},
  createdBy: {type: String, required: true}
});

module.exports = mongoose.model('Comment', commentSchema);