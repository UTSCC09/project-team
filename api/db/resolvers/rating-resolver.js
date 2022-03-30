const Rating = require('../models/rating-model');
const { isAuthenticated } = require('../../util');

createRating = async function (input, context) {
  let auth = isAuthenticated(context.req);
  if (auth) return auth();
  const ratingInput = Object.assign({}, input, { createdBy: context.req.session.user.username });
  const rating = await new Rating(ratingInput).save();
  return rating;
}

getRatings = async function (input) {
  const ratings = await Rating.find(input).exec();
  return { 'ratings': ratings };
}

updateRating = async function (input, context) {
  let auth = isAuthenticated(context.req);
  if (auth) return auth();
  const rating = await Rating.findOneAndUpdate({ lId: input.IId, createdBy: context.req.session.user.username }, input).exec();
  return rating;
}

module.exports = {
  createRating,
  getRatings,
  updateRating
}
