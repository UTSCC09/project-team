const fs = require('fs');
const path = require('path');
var uuid = require('node-uuid');

const Image = require('../models/image-model');
const Pin = require('../models/pin-model');
const {isAuthenticated} = require('../../util');

createImage = async function (input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
    // Validate location exists in db
    const pin = await Pin.findOne({_id: context.req.params.id}).exec();

    console.log(input);
    const {createReadStream, filename, mimetype, encoding} = await input.image;
    console.log(filename);
    const file_id = uuid.v4()
    const fileExt = filename.split('.').pop();
    const upload_path = path.join(__dirname, `/../../static/images/${file_id + '.' + fileExt}`);
    const stream = createReadStream();
    const out = fs.createWriteStream(upload_path);
    await stream.pipe(out);
    const image = await new Image({
        user: context.req.session.user,
        title: input.title,
        image: file_id + '.' + fileExt,
        pin: pin._id
    }).save();
    return image;
};

getImages = async function (context) {
    // Validate location exists in db
    const pin = await Pin.findOne({_id: context.req.params.id}).exec();

    const images = await Image.find({pin: pin._id}).exec();
    return {'images': images};
}

getPhoto = async function({input}, context) {
    const image = await Image.findOne({_id: context.req.params.id}).exec();
    console.log(image);
    return ({url: "http://178.128.230.225:8000/images/" + image.image});
}

deleteImage = async function(context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
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
