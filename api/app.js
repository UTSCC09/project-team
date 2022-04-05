const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const cors = require('cors');
const db = require('./db/db');
const commentResolver = require('./db/resolvers/comment-resolver');
const ratingResolver = require('./db/resolvers/rating-resolver');
const userSchema = require('./graphql/schemas/user-schema');
const pinSchema = require('./graphql/schemas/pin-schema');
const commentSchema = require('./graphql/schemas/comment-schema');
const ratingSchema = require('./graphql/schemas/rating-schema');
const polygonSchema = require('./graphql/schemas/polygon-schema');
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

app.use(function(req, res, next){
    // Parse cookies fromr equest if they exist
    let cookies = cookie.parse(req.headers.cookie || '');
    // Set request user to current session user if exists, otherwise null
    req.username = (req.session.user)? req.session.user.username : null;
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.use('/user', graphqlHTTP((req, res)=>{
    console.log(req);
    return {
        schema: userSchema.schema,
        graphiql: true,
        context: {req, res},
    };
}));

app.use('/rating', graphqlHTTP((req, res)=>{
    return {
        schema: ratingSchema.schema,
        graphiql: true,
        context: {req, res},
    };
}));


app.use('/pin/:id/image/', graphqlHTTP((req, res)=>{
    return {
        schema: imageSchema.schema,
        graphiql: true,
        context: {req, res},
    };
}));

app.use('/pin/:id', graphqlHTTP((req, res)=>{
    return {
        schema: pinSchema.idSchema,
        graphiql: true,
        context: {req, res},
    };
}));

app.use('/pin', graphqlHTTP((req, res)=>{
    return {
        schema: pinSchema.schema,
        graphiql: true,
        context: {req, res},
    };
}));

app.use('/comment', graphqlHTTP((req, res)=>{
    return {
        schema: commentSchema.schema,
        graphiql: true,
        context: {req, res},
    };
}));

app.use('/polygon/:id', graphqlHTTP((req, res)=>{
    return {
        schema: polygonSchema.idSchema,
        graphiql: true,
        context: {req, res},
    };
}));

app.use('/polygon', graphqlHTTP((req, res)=>{
    return {
        schema: polygonSchema.schema,
        graphiql: true,
        context: {req, res},
    };
}));

app.use('/image/:id', graphqlHTTP((req, res)=>{
    return {
        schema: imageSchema.photoSchema,
        graphiql: true,
        context: {req, res}
    };
}));

const PORT = 8000;
app.listen(PORT, () => {
    console.log('Running a GraphQL server');
});
