const Comment = require('../models/comment-model');

createComment = async function ({input}) {
  const comment = await new Comment(input).save();
  return comment;
}

getComments = async function ({input}) {
  const comments = await Comment.find(input).exec();
  return comments;
}

module.exports = {
  createComment,
  getComments
};