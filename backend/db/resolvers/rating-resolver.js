const Rating = require('../models/rating-model');
const { isAuthenticated, sanitizeInput } = require('../../util');

createRating = async function (input, context) {
  let auth = isAuthenticated(context.req);
  if (auth) return auth();
  let cleanInput = sanitizeInput(input);
  const ratingInput = Object.assign({}, cleanInput, { createdBy: context.req.session.user.username });
  const rating = await new Rating(ratingInput).save();
  return rating;
};

getRatings = async function (input) {
  let cleanInput = sanitizeInput(input);
  const ratings = await Rating.find(cleanInput).exec();
  const sum = ratings.reduce((previousValue, currentValue) => previousValue + currentValue.stars, 0)/ratings.length;
  const average = ratings.length == 0 ? 0 : sum/ratings.length;
  return { 'ratings': ratings, 'average': average };
};

updateRating = async function (input, context) {
  let auth = isAuthenticated(context.req);
  if (auth) return auth();
  let lId = sanitizeInput(input.lId);
  let cleanInput = sanitizeInput(input);
  const rating = await Rating.findOneAndUpdate({ lId: lId, createdBy: context.req.session.user.username }, cleanInput, { returnOriginal: false });
  return rating;
};

module.exports = {
  createRating,
  getRatings,
  updateRating
};
