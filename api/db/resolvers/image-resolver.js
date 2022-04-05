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
    let page;
    let ordering = -1;
    switch(input.goto) {
        case GoToEnum.newest:
            page = 0;
            break;
        case GoToEnum.oldest:
            page = 0;
            ordering = 1;
            break;
        case GoToEnum.page:
            page = sanitizeInput(context.req.params.id);
            break;
    }

    // Determine if there is a newer image
    let hasNewerPage = page - 1 > 0;
    let newerPage = hasNewerPage ? page - 1 : 0;
    const images = await Image.find({pin: pin._id}).sort({createdAt: ordering}).skip(newerPage).limit(3).exec();
    if (images.length == 0) return NotFoundError("page = " + page);
    // Determine which index has the current image based on if theres a newer image
    let currentImage = hasNewerPage ? images[1] : images[0];
    // Determine which index has the image newer then the current
    let newerImage = hasNewerPage ? images[0] : null;
    // Determine which index has the older image based on whether indices of current and newer image
    let olderImage = null;
    if (!hasNewerPage && images.length == 2) {
        olderImage = images[1];
    } else if (hasNewerPage && images.length == 3) {
        olderImage = images[2];
    }
    
    return {'older': olderImage, 'current': currentImage, 'newer': newerImage};
}

getPhoto = async function(context) {
    let id = sanitizeInput(context.req.params.id);
    const image = await Image.findOne({_id: id}).exec();
    return ({url: "http://localhost:8000/images/" + image.image});
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
  getPhoto,
  deleteImage,
  GoToEnum
}
