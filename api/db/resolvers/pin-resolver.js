const Pin = require('../models/pin-model');

createPin = async function ({input}) {
  const pin = await new Pin(input).save();
  return pin;
};

getPin = async function ({input}) {
    const pin = await Pin.findOne(input).exec();
    return pin;
};

getNear = async function ({input}) {
    const pins = await Pin.find({
        'features.geometry': {
            $near: {
                $maxDistance: input.radius,
                $geometry: {
                    type: "Point",
                    coordinates: [input.lon, input.lat]
                }
            }
        }
    })
    return pins;
};

listPins = async function ({input}) {
    const pins = await Pin.find().exec();
    return pins;
};

module.exports = {
  createPin,
  getPin,
  getNear,
  listPins
}
