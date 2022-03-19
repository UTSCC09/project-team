// sudo mongod --dbpath ~/data/db to run instance
const mongoose = require('mongoose');
// const MONGO_USERNAME = "loq";
// const MONGO_PASSWORD = "Mjj2Dthx8r9eqVs9";
// const MONGO_HOSTNAME = '127.0.0.1';
// const MONGO_PORT = '27017';
// const MONGO_DB = 'test';
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