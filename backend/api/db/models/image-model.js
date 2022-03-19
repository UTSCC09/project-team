const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    pin: { type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
});

module.exports = mongoose.model('Image', imageSchema);
