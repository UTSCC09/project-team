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
  const average = ratings.reduce((previousValue, currentValue) => previousValue + currentValue.stars, 0)/ratings.length
  return { 'ratings': ratings, 'average': average };
}

updateRating = async function (input, context) {
  let auth = isAuthenticated(context.req);
  if (auth) return auth();
  const rating = await Rating.findOneAndUpdate({ lId: input.lId, createdBy: context.req.session.user.username }, input, { returnOriginal: false });
  return rating;
}

module.exports = {
  createRating,
  getRatings,
  updateRating
}
