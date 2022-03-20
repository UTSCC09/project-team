// sudo mongod --dbpath ~/data/db to run instance
const mongoose = require('mongoose');
const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB
} = process.env

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

module.exports = mongoose.connect(url, {useNewUrlParser: true});

mongoose.connection.on("connected", () => {
    console.log("connected to monogodb");
});