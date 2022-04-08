const fs = require('fs');
const path = require('path');
var uuid = require('node-uuid');

const Image = require('../models/image-model');
const Pin = require('../models/pin-model');
const {isAuthenticated, isAuthorized, sanitizeInput} = require('../../util');
const {UserInputError, NotFoundError} = require('../../graphql/schemas/error-schema')

const GoToEnum = {oldest: 'oldest', newest: 'newest', page: 'page'};

createImage = async function (input, context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
    let id = sanitizeInput(context.req.params.id);
    let title = sanitizeInput(input.title);
    // Validate location exists in db
    const pin = await Pin.findOne({_id: id}).exec();

    const {createReadStream, filename, mimetype, encoding} = await input.image;
    let fileExt = null;
    if (mimetype == 'image/jpeg') {
        fileExt = 'jpg';
    }
    else if (mimetype == 'image/png') {
        fileExt = 'png';
    }
    else {
        return UserInputError("Image file");
    }

    const file_id = uuid.v4()
    const upload_path = path.join(__dirname, `/../../static/images/${file_id + '.' + fileExt}`);
    const stream = createReadStream();
    const out = fs.createWriteStream(upload_path);
    await stream.pipe(out);
    const image = await new Image({
        user: context.req.session.user,
        title: title,
        image: file_id + '.' + fileExt,
        pin: pin._id
    }).save();
    return image;
};

getImages = async function (context) {
    // Validate location exists in db
    let id = sanitizeInput(context.req.params.id);
    const pin = await Pin.findOne({_id: id}).exec();

    const images = await Image.find({pin: pin._id}).exec();
    return {'images': images};
}

getImagePage = async function (input, context) {
    // Validate location exists in db
    let id = sanitizeInput(context.req.params.id);
    const pin = await Pin.findOne({_id: id}).exec();
    let ordering = input.goto == GoToEnum.newest ? -1 : 1;

    // Determine if there is a newer image
    const image = await Image.findOne({pin: pin._id}).sort({created_at: ordering}).exec();
    return image;
}

getAdajcentImage = async function (input, context) {
    let currentImageId = sanitizeInput(input.imageId);
    let pinId = sanitizeInput(context.req.params.id);
    const currentImage = await Image.findOne({_id: currentImageId}).exec();
    
    let prevImage = await Image.findOne({pin: pinId}).where('created_at').gt(currentImage.created_at).sort({created_at: 1}).exec();
    if (prevImage == null) {
        prevImage = await Image.findOne({pin: pinId}).sort({created_at: 1}).exec();
    }

    let nextImage = await Image.findOne({pin: pinId}).where('created_at').lt(currentImage.created_at).sort({created_at: -1}).exec();
    if (nextImage == null) {
        nextImage = await Image.findOne({pin: pinId}).sort({created_at: -1}).exec();
    }

    return {next: nextImage, previous: prevImage};
    
}

getPhoto = async function(context) {
    let id = sanitizeInput(context.req.params.id);
    const image = await Image.findOne({_id: id}).exec();
    return ({url: "https://place-holder.live/api/images/" + image.image});
}

deleteImage = async function(context) {
    let auth = isAuthenticated(context.req);
    if (auth) return auth();
    let id = sanitizeInput(context.req.params.id);
    const image = await Image.findOne({_id: id}).exec();
    let perm = isAuthorized(context.req, image.user);
    if (perm) return perm();
    const status = Image.deleteOne({_id: image._id}).exec();
    const upload_path = path.join(__dirname, `/../../static/images/${image.image}`);
    fs.unlinkSync(upload_path);
    return null;
}

module.exports = {
  createImage,
  getImages,
  getImagePage,
  getAdajcentImage,
  getPhoto,
  deleteImage,
  GoToEnum
}
