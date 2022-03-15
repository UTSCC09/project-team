const fs = require('fs');
const path = require('path');

const Image = require('../models/image-model');
const Pin = require('../models/pin-model');

createImage = async function ({input}, context) {
    // Validate location exists in db
    const pin = await Pin.findOne({_id: context.params.id}).exec();

    const {createReadStream, filename, mimetype, encoding} = await input.image.file;
    const upload_path = path.join(__dirname, `/../../static/images/${filename}`);
    const stream = createReadStream();
    const out = fs.createWriteStream(upload_path);
    await stream.pipe(out);
    const image = await new Image({
        title: input.title,
        image: filename,
        pin: pin._id
    }).save();
    return image;
};

getImages = async function ({input}, context) {
    // Validate location exists in db
    const pin = await Pin.findOne({_id: context.params.id}).exec();

    const images = await Image.find({pin: pin._id}).exec();
    return images;
}

getPhoto = async function({input}, context) {
    const image = await Image.findOne({_id: context.params.id}).exec();
    return ({url: "http://localhost:8000/images/" + image.image});
}

module.exports = {
  createImage,
  getImages,
  getPhoto
}
