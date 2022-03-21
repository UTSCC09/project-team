const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagTypes = ['Amusment Park', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Theatre', 'Arena', 'Stadium', 'Hotel', 
    'Motel', 'Court', 'City Hall', 'Landmark'];

const propertySchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String},
    tags: {type: [String], enum: tagTypes}
});

const geometrySchema = new mongoose.Schema({
    type: {type: String, required: true},
    coordinates: [{type: Number, required: true}]
});

const featureSchema = new mongoose.Schema({
    type: {type: String, required: true},
    geometry: {type: geometrySchema, required: true},
    properties: {type: propertySchema, required: true}
});

const pinSchema = new mongoose.Schema({
    type: {type: String, required: true},
    features: {type: featureSchema, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
});

pinSchema.index({"features.geometry": '2dsphere'}, {unique: false})

module.exports = mongoose.model('Pin', pinSchema);
