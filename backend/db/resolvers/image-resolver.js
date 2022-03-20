const fs = require('fs');
const path = require('path');

const Image = require('../models/image-model');
const Pin = require('../models/pin-model');

createImage = async function ({input}, context) {
    // Validate location exists in db
    const pin = await Pin.findOne({_id: context.req.params.id}).exec();

    const {createReadStream, filename, mimetype, encoding} = await input.image.file;
    const upload_path = path.join(__dirname, `/../../static/images/${filename}`);
    const stream = createReadStream();
    const out = fs.createWriteStream(upload_path);
    await stream.pipe(out);
    const image = await new Image({
        user: context.req.session.user,
        title: input.title,
        image: filename,
        pin: pin._id
    }).save();
    return image;
};

getImages = async function ({input}, context) {
    // Validate location exists in db
    const pin = await Pin.findOne({_id: context.req.params.id}).exec();

    const images = await Image.find({pin: pin._id}).exec();
    return images;
}

getPhoto = async function({input}, context) {
    const image = await Image.findOne({_id: context.params.id}).exec();
    console.log(image);
    return ({url: "http://localhost:8000/images/" + image.image});
}

deleteImage = async function({input}, context) {
    const image = await Image.findOne({_id: context.params.id}).exec();
    const status = Image.deleteOne({_id: context.params.id}).exec();
    const upload_path = path.join(__dirname, `/../../static/images/${image.image}`);
    console.log(status, upload_path);
    fs.unlinkSync(upload_path);
    return null;
}

module.exports = {
  createImage,
  getImages,
  getPhoto,
  deleteImage
}
