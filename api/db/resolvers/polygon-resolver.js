const Polygon = require('../models/polygon-model');
const Pin = require('../models/pin-model');

createPolygon = async function ({input}) {
  const polygon = await new Polygon(input).save();
  return polygon;
};

getPolygon = async function ({input}) {
    const polygon = await Polygon.findOne(input).exec();
    return polygon;
};

listPolygons = async function ({input}) {
    const polygons = await Polygon.find().exec();
    return polygons;
};

getNear = async function ({input}) {
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
    return polygons;
};

getPinsWithin = async function({input}) {
    const polygon = await Polygon.findOne(input).exec();
    const pins = await Pin.find({
        'features.geometry': {
            $geoWithin: {
                $geometry: polygon.features.geometry
            }
        }
    });
    console.log(pins)
    console.log(pins[0].features.geometry.coordinates);
    return pins;
}

module.exports = {
  createPolygon,
  getPolygon,
  listPolygons,
  getPinsWithin,
  getNear
}
