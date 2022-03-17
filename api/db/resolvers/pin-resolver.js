const fs = require('fs');
const path = require('path');

const Pin = require('../models/pin-model');
const Image = require('../models/image-model');

createPin = async function ({input}, context) {
    const pinInput = Object.assign({}, input, {user: context.req.session.user});
    const pin = await new Pin(pinInput).save();
    return pin;
};

getPin = async function ({input}, context) {
    const pin = await Pin.findOne({_id: context.req.params.id}).exec();
    console.log(pin, context.req.params.id);
    return pin;
};

addTag = async function ({input}, context) {
    let pin = await Pin.findOne({_id: context.req.params.id}).exec();
    console.log(pin);
    pin.features.properties.tags.push(input.tag);
    pin.save();
    return pin;
}

deleteTag = async function ({input}, context) {
    let pin = await Pin.findOne({_id: context.req.params.id}).exec();
    console.log(pin);
    pin.features.properties.tags.pop(input.tag);
    pin.save();
    return pin;
}

getNear = async function ({input}) {
    const radius = input.radius;
    const tags = input.tags;
    if (radius > 2000){
        console.log("Too large");
    }
    const test = await Pin.find({'features.properties.tags': tags}).exec();
    console.log(test);
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
        },
    ).find({'features.properties.tags': tags},).exec();
    console.log(pins);
    return pins;
};

listPins = async function ({input}) {
    const pins = await Pin.find().exec();
    return pins;
};

deletePin = async function({input}, context) {
    const pin = await Pin.findOne({_id: context.req.params.id}).exec();
    Pin.deleteOne({_id: context.req.params.id}).exec();
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
  deletePin,
  addTag,
  deleteTag
}
