const fs = require('fs');
const path = require('path');

const Pin = require('../models/pin-model');
const Image = require('../models/image-model');

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

deletePin = async function({input}) {
    const pin = await Pin.findOne(input).exec();
    Pin.deleteOne(input).exec();
    const images = await Image.find({pin: pin._id}).exec();
    let upload_path = "";
    console.log(images);
    for (const image of images) {
        Image.deleteOne({_id: image.id}).exec();
        upload_path = path.join(__dirname, `/../../static/images/${image.image}`);
        console.log(upload_path);
        fs.unlinkSync(upload_path);
    }
    return null;
}

module.exports = {
  createPin,
  getPin,
  getNear,
  listPins,
  deletePin
}
