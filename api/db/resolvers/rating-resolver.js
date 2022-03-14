const Rating = require('../models/rating-model');

createRating = async function ({ input }) {
  const rating = await new Rating(input).save();
  return rating;
}

getRatings = async function ({ input }) {
  const ratings = await Rating.find(input).exec();
  return ratings;
}

updateRating = async function ({ input }) {
  const rating = await Rating.findOneAndUpdate({lId: input.lId, createdBy: input.createdBy}, input).exec();
  return rating;
}

module.exports = {
  createRating,
  getRatings,
  updateRating
}