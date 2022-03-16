const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    name: {type: String, required: true}
});

const geometrySchema = new mongoose.Schema({
    type: {type: String, required: true},
    coordinates: [{type: Number, require: true}]
});

const featureSchema = new mongoose.Schema({
    type: {type: String, required: true},
    geometry: {type: geometrySchema, require: true},
    properties: {type: propertySchema, require: true}
});

const pinSchema = new mongoose.Schema({
    type: {type: String, required: true},
    features: {type: featureSchema, required: true}
});

pinSchema.index({"features.geometry": '2dsphere'}, {unique: false})

module.exports = mongoose.model('Pin', pinSchema);
