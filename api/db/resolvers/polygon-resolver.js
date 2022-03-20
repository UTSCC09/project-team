const Polygon = require('../models/polygon-model');
const Pin = require('../models/pin-model');

createPolygon = async function (input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
    const polygonInput = Object.assign({}, input, {user: context.req.session.user});
    const polygon = await new Polygon(polygonInput).save();
    return polygon;
};

getPolygon = async function (input, context) {
    const polygon = await Polygon.findOne({_id: context.req.params.id}).exec();
    return polygon;
};

listPolygons = async function ({input}) {
    const polygons = await Polygon.find().exec();
    return {'polygons': polygons};
};

getNear = async function (input) {
    console.log("test");
    const radius = input.radius
    if (radius > 2000){
        console.log("Too large");
    }
    const polygons = await Polygon.find({
        'features.geometry': {
            $near: {
                $maxDistance: radius,
                $geometry: {
                    type: "Point",
                    coordinates: [input.lon, input.lat]
                }
            }
        }
    });
    return {'polygons': polygons};
};

getPinsWithin = async function(input, context) {
    const polygon = await Polygon.findOne({_id: context.req.params.id}).exec();
    const pins = await Pin.find({
        'features.geometry': {
            $geoWithin: {
                $geometry: polygon.features.geometry
            }
        }
    });
    return {'pins': pins};
}

deletePolygon = async function(input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
    const polygon = await Polygon.findOne({_id: context.req.params.id}).exec();
    Polygon.deleteOne(polygon._id).exec();
    return null;
}

module.exports = {
  createPolygon,
  getPolygon,
  listPolygons,
  getPinsWithin,
  deletePolygon,
  getNear
}
