const Polygon = require('../models/polygon-model');
const Pin = require('../models/pin-model');
const {isAuthenticated, isAuthorized, sanitizeInput} = require('../../util');

// Create polygon from given input for current user
createPolygon = async function (input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();

    const polygonInput = Object.assign({}, input, {user: context.req.session.user, owner: context.req.session.user.username});
    const polygon = await new Polygon(polygonInput).save();
    return polygon;
};

// Get all polygons within a certain radius
getNear = async function (input) {
    const radius = sanitizeInput(input.radius);
    const lat = sanitizeInput(input.lat);
    const lon = sanitizeInput(input.lon);

    // Restrict radius
    if (radius > 2000){
        return UserInputError(radius);
    }
    // For a lon-lat coordinate, get all polygons within radius(meters)
    let polygons = Polygon.find({
        'features.geometry': {
            $near: {
                $maxDistance: radius,
                $geometry: {
                    type: "Point",
                    coordinates: [lon, lat]
                }
            }
        }
    });

    // Limit to only 50 most frequent polygons
    polygons = await polygons.sort({updated_at: -1}).limit(50).exec();

    return {'polygons': polygons};
};

// Get all pins within the area of a polygon
getPinsWithin = async function(input, context) {
    let id = sanitizeInput(context.req.params.id);

    // Get the polygon, then use polygon shape to create search area for pins
    const polygon = await Polygon.findOne({_id: id}).exec();
    let pins = Pin.find({
        'features.geometry': {
            $geoWithin: {
                $geometry: polygon.features.geometry
            }
        }
    });

    // Limit to only 50 most frequent pins
    pins = await pins.sort({updated_at: -1}).limit(50).exec();
    return {'pins': pins};
};

// Delete a polygon
// Only polygon creator can perform this action
deletePolygon = async function(input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();

    let id = sanitizeInput(context.req.params.id);

    const polygon = await Polygon.findOne({_id: id}).exec();

    // Check if user has perms to delete polygon
    let perm = isAuthorized(context.req, polygon.user);
    if (perm) return perm();

    Polygon.deleteOne({_id: polygon._id}).exec();
    return null;
};

module.exports = {
  createPolygon,
  getPinsWithin,
  deletePolygon,
  getNear
};
