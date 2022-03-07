const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    buildSchema
} = require('graphql');

const db = require('./db/db');
const userResolver = require('./db/resolvers/user-resolver');

var schema = buildSchema(`
    input UserInput {
        username: String
        password: String
    }

    type User {
        username: String
        password: String
    }

    type Mutation {
        createUser(input: UserInput): User
    }

    type Query {
        signin(input: UserInput): User
    }

`);

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

const session = require('express-session');
app.use(session({
    secret: 'default secret to be changed',
    resave: false,
    saveUninitialized: true
}));

const cookie = require('cookie');
const { graphqlHTTP } = require('express-graphql');

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: userResolver,
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

const PORT = 8000;
app.listen(PORT, () => {
    console.log('Running a GraphQL server');
});
