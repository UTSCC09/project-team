const mongoose = require('mongoose');

const coordinateSchema = new mongoose.Schema({
    lat: {type: Number, required: true},
    lon: {type: Number, required: true}
});

const geometrySchema = new mongoose.Schema({
    type: {type: String, required: true},
    coordinates: [{type: coordinateSchema, require: true}]
});

const featureSchema = new mongoose.Schema({
    type: {type: String, required: true},
    geometry: {type: geometrySchema, require: true}
});

const locationSchema = new mongoose.Schema({
    type: {type: String, required: true},
    features: {type: featureSchema, required: true}
});

module.exports = mongoose.model('Location', locationSchema);
