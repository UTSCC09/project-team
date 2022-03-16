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
  getPinsWithin
}
