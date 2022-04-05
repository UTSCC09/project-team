// sudo mongod --dbpath ~/data/db to run instance
const mongoose = require('mongoose');

// Connect to mongodb database
module.exports = mongoose.connect('mongodb://localhost:27017/test')

mongoose.connection.on("connected", () => {
    console.log("connected to monogodb");
});
