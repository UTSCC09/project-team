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
    const radius = input.radius
    if (radius > 2000){
        console.log("Too large");
    }
    const pins = await Pin.find({
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
    return pins;
};

listPins = async function ({input}) {
    const pins = await Pin.find().exec();
    return pins;
};

deletePin = function({input}) {
    const pin = Pin.deleteOne(input).exec();
    return null;
}

module.exports = {
  createPin,
  getPin,
  getNear,
  listPins,
  deletePin
}
