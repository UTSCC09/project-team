const fs = require('fs');
const path = require('path');

const Pin = require('../models/pin-model');
const Image = require('../models/image-model');

const {isAuthenticated, isAuthorized, capitalizeFirst, sanitizeInput} = require('../../util');
const {DupelicateError, UserInputError} = require('../../graphql/schemas/error-schema')

const {Wit, log} = require('node-wit');

const client = new Wit({
  accessToken: "2EHFQJNOAPLROBR7OVCXGRUUR33W7IMH",
  logger: new log.Logger(log.DEBUG), // optional
});

createPin = async function (input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
    let cleanInput = sanitizeInput(input);
    const pinInput = Object.assign({}, cleanInput, {user: context.req.session.user, owner: context.req.session.user.username});
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
    let id = sanitizeInput(context.req.params.id);
    let tag = sanitizeInput(input.tag);
    let pin = await Pin.findOne({_id: id}).exec();
    if (pin.features.properties.tags.includes(tag)) {
        return(DupelicateError(tag));
    }
    pin.features.properties.tags.push(tag);
    pin.save();
    return pin;
}

deleteTag = async function (input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
    let id = sanitizeInput(context.req.params.id);
    let tag = sanitizeInput(input.tag);
    let pin = await Pin.findOne({_id: id}).exec();
    pin.features.properties.tags.pop(tag);
    pin.save();
    return pin;
}

getNear = async function (input) {
    const radius = sanitizeInput(input.radius);
    const tags = sanitizeInput(input.tags);
    const lat = sanitizeInput(input.lat);
    const lon = sanitizeInput(input.lon);
    pins = await searchPins(radius, lat, lon, tags);
    if (!pins) {
        return UserInputError(radius);
    }
    return {'pins': pins};
};

listPins = async function (context) {
    const pins = await Pin.find().sort({updated_at: -1}).exec();
    return {'pins': pins};
};

deletePin = async function(input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
    let id = sanitizeInput(context.req.params.id);
    pin = await Pin.findOne({_id: id}).exec();
    let perm = isAuthorized(context.req, pin.user);
    if (perm) return perm();
    Pin.deleteOne({_id: pin._id}).exec();
    const images = await Image.find({pin: pin._id}).exec();
    let upload_path = "";
    for (const image of images) {
        Image.deleteOne({_id: image.id}).exec();
        upload_path = path.join(__dirname, `/../../static/images/${image.image}`);
        fs.unlinkSync(upload_path);
    }
    return null;
}

searchPinByTag = async function(input, context) {
    const text = input.message;
    const speech = input.speech;
    let data = null
    if (speech) {
        const {createReadStream, filename, mimetype, encoding} = await input.speech;
        data = await client.speech(mimetype, createReadStream());
    }
    else if (text) {
        data = await client.message(text, {});
    }
    else {
        return UserInputError();
    }
    if (data.intents.some(elem => elem.name == 'search_nearby')){
        let tags = [];
        for (const [key, value] of Object.entries(data.entities)) {
            tags.push(capitalizeFirst(value[0].name));
        }
        if (tags.length == 0) {
            return UserInputError(text);
        }
        const radius = sanitizeInput(input.radius);
        const lat = sanitizeInput(input.lat);
        const lon = sanitizeInput(input.lon);
        pins = await searchPins(radius, lat, lon, tags);
        if (!pins) {
            return UserInputError(radius);
        }
        return {'tags': tags, 'pins': pins};
    }
    else {
        return UserInputError(text);
    }
}

searchPins = async function(radius, lat, lon, tags) {
    if (radius > 20000){
        return null;
    }
    let pins = Pin.find({
            'features.geometry': {
                $near: {
                    $maxDistance: radius,
                    $geometry: {
                        type: "Point",
                        coordinates: [lon, lat]
                    }
                }
            }
        },
    );
    if (tags.length > 0) {
        pins = pins.find({'features.properties.tags': {"$in": tags}},);
    }
    pins = await pins.sort({updated_at: -1}).limit(50).exec();
    return pins;
}

module.exports = {
  createPin,
  getPin,
  getNear,
  listPins,
  deletePin,
  addTag,
  deleteTag,
  searchPinByTag
}
