const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  stars: {
    type: Number,
    min: [0, 'Ratings must be between 0 and 5, got {VALUE}'],
    max: [5, 'Ratings must be between 0 and 5, got {VALUE}']
  },
  lId: { type: String, required: true },
  createdBy: { type: String, required: true },
  review: { type: String, required: true }
});

ratingSchema.index({lId: 1, createdBy: 1}, { unique: true });
module.exports = mongoose.model('Rating', ratingSchema);