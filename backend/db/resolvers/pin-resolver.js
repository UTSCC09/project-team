const fs = require('fs');
const path = require('path');

const Pin = require('../models/pin-model');
const Image = require('../models/image-model');

const {isAuthenticated, isAuthorized, capitalizeFirst, sanitizeInput} = require('../../util');
const {DupelicateError, UserInputError} = require('../../graphql/schemas/error-schema')

const {Wit, log} = require('node-wit');

// Create wit.ai client for ML component
const client = new Wit({
  accessToken: process.env.WIT_ACCESS_TOKEN,
  logger: new log.Logger(log.DEBUG), // optional
});

// Create pin from given input for current user
createPin = async function (input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();

    let cleanInput = sanitizeInput(input);

    const pinInput = Object.assign({}, cleanInput, {user: context.req.session.user, owner: context.req.session.user.username});
    const pin = await new Pin(pinInput).save();

    return pin;
};

// Add tag to a pin
// Only authenticated users can perform this action
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

// Delete tag from a pin
// Only authenticated users can perform this action
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

// Get all pins within a certain radius given a set of tags
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

// Delete a pin
// Only pin creator can perform this action
// Delete all images associated with the pin
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

// Get all pins in a certain radius given parameters
// Parameters can be: natural language string, audio file
searchPinByTag = async function(input, context) {
    const text = input.message;
    const speech = input.speech;

    let data = null
    // If an audio file was sent, extract data from file
    if (speech) {
        // Read data from read audio file
        const {createReadStream, filename, mimetype, encoding} = await input.speech;
        // Send data to wit to extract usable patterns
        data = await client.speech(mimetype, createReadStream());
    }
    // If text was sent, extract data from string
    else if (text) {
        // Send data to wit to extract usable patterns
        data = await client.message(text, {});
    }
    // No data was sent, nothing to look up
    else {
        return UserInputError();
    }

    // If intent of user input is to search, perform search with other parameters
    if (data.intents.some(elem => elem.name == 'search_nearby')){
        // Extract tags from wit response data into array of tags
        let tags = [];
        for (const [key, value] of Object.entries(data.entities)) {
            tags.push(capitalizeFirst(value[0].name));
        }

        // User did not indicate a valid tag
        if (tags.length == 0) {
            return UserInputError(text);
        }

        // Perform search
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

// Search helper
searchPins = async function(radius, lat, lon, tags) {
    // Search area too large
    if (radius > 20000){
        return null;
    }
    // For a lon-lat coordinate, get all pins within radius(meters)
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
    // Extract only pins with tags matching input
    if (tags.length > 0) {
        pins = pins.find({'features.properties.tags': {"$in": tags}},);
    }
    // Limit to only 50 most frequent pins
    pins = await pins.sort({updated_at: -1}).limit(50).exec();
    return pins;
}

module.exports = {
  createPin,
  getNear,
  deletePin,
  addTag,
  deleteTag,
  searchPinByTag
}
