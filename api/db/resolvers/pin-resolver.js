const fs = require('fs');
const path = require('path');

const Pin = require('../models/pin-model');
const Image = require('../models/image-model');

const {isAuthenticated, isAuthorized} = require('../../util');
const {DupelicateError} = require('../../graphql/schemas/error-schema')

createPin = async function (input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
    const pinInput = Object.assign({}, input, {user: context.req.session.user});
    const pin = await new Pin(pinInput).save();
    return pin;
};

getPin = async function (context) {
    const pin = await Pin.findOne({_id: context.req.params.id}).exec();
    return pin;
};

addTag = async function (input , context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
    let pin = await Pin.findOne({_id: context.req.params.id}).exec();
    if (pin.features.properties.tags.includes(input.tag)) {
        return(DupelicateError(input.tag));
    }
    pin.features.properties.tags.push(input.tag);
    pin.save();
    return pin;
}

deleteTag = async function (input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
    let pin = await Pin.findOne({_id: context.req.params.id}).exec();
    pin.features.properties.tags.pop(input.tag);
    pin.save();
    return pin;
}

getNear = async function (input) {
    const radius = input.radius;
    const tags = input.tags;
    if (radius > 20000){
        console.log("Too large");
    }
    console.log(tags);
    let pins = Pin.find({
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
    );
    if (tags.length > 0) {
        pins = await pins.find({'features.properties.tags': {"$all": tags}},).exec();
    }
    else {
        pins = await pins.exec();
    }
    console.log(pins);
    return {'pins': pins};
};

listPins = async function (context) {
    const pins = await Pin.find().exec();
    return {'pins': pins};
};

deletePin = async function(input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
    pin = await Pin.findOne({_id: context.req.params.id}).exec();
    let perm = isAuthorized(context.req, pin.user);
    if (perm) return perm();
    Pin.deleteOne({_id: pin._id}).exec();
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
