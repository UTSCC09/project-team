const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const cors = require('cors');
const db = require('./db/db');
const {
    createPin,
    getPin,
    getNear,
    listPins,
    deletePin,
    addTag,
    deleteTag
} = require('./db/resolvers/pin-resolver');
const commentResolver = require('./db/resolvers/comment-resolver');
const ratingResolver = require('./db/resolvers/rating-resolver');
const userSchema = require('./graphql/schemas/user-schema');
const pinSchema = require('./graphql/schemas/pin-schema');
const commentSchema = require('./graphql/schemas/comment-schema');
const ratingSchema = require('./graphql/schemas/rating-schema');
const polygonResolver = require('./db/resolvers/polygon-resolver');
const polygonSchema = require('./graphql/schemas/polygon-schema');
const {
    createImage,
    getImages,
    getPhoto,
    deleteImage
} = require('./db/resolvers/image-resolver');
const imageSchema = require('./graphql/schemas/image-schema');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(cors());


app.use(express.static('static'));

const {
    GraphQLUpload,
    graphqlUploadExpress
} = require('graphql-upload');
app.use(graphqlUploadExpress());

const session = require('express-session');
app.use(session({
    secret: 'default secret to be changed',
    resave: false,
    saveUninitialized: true
}));

const cookie = require('cookie');
const { graphqlHTTP } = require('express-graphql');

app.use('/user', graphqlHTTP((req, res)=>{
    return {
        schema: userSchema.schema,
        graphiql: true,
        context: {req, res},
    };
}));

app.use('/rating', graphqlHTTP({
    schema: ratingSchema.schema,
    rootValue: ratingResolver,
    graphiql: true
}));


app.use('/pin/:id/image', graphqlHTTP((req, res)=>{
    return {
        schema: imageSchema.schema,
        rootValue: {createImage, getImages},
        graphiql: true,
        context: {req, res},
    };
}));

app.use('/pin/:id', graphqlHTTP((req, res)=>{
    return {
        schema: pinSchema.schema,
        rootValue: {getPin, deletePin, addTag, deleteTag},
        graphiql: true,
        context: {req, res},
    };
}));

app.use('/pin', graphqlHTTP((req, res)=>{
    return {
        schema: pinSchema.schema,
        rootValue: {createPin, getNear,listPins},
        graphiql: true,
        context: {req, res},
    };
}));

app.use('/comment', graphqlHTTP({
    schema: commentSchema.schema,
    rootValue: commentResolver,
    graphiql: true
}));

app.use('/polygon', graphqlHTTP((req, res)=>{
    return {
        schema: polygonSchema.schema,
        rootValue: polygonResolver,
        graphiql: true,
        context: {req, res},
    };
}));


app.use('/image/:id', graphqlHTTP({
    schema: imageSchema.schema,
    rootValue: {getPhoto, deleteImage},
    graphiql: true
}));

app.use(function(req, res, next){
    // Parse cookies fromr equest if they exist
    let cookies = cookie.parse(req.headers.cookie || '');
    // Set request user to current session user if exists, otherwise null
    req.username = (req.session.user)? req.session.user._id : null;
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log('Running a GraphQL server');
});