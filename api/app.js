const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString
} = require('graphql');

// sudo mongod --dbpath ~/data/db to run instance
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test',
    () => {
        console.log("connected")
    },
    e => console.log(e)
);
const schema = require('./db.js');
let User = mongoose.model('User');

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

app.use('/graphql', expressGraphQL({
    graphiql: true
}))

app.use(function(req, res, next){
    // Parse cookies fromr equest if they exist
    let cookies = cookie.parse(req.headers.cookie || '');
    // Set request user to current session user if exists, otherwise null
    req.username = (req.session.user)? req.session.user._id : null;
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.post('/signup/', function(req, res, next){
    const saltRounds = 10;
    let username = req.body.username;
    let password = req.body.password;
    User.findById(username, function(err, user){
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("username " + username + " already exists");
        bcrypt.hash(password, saltRounds, function(err, hash){
            const user = new User({ _id: username, hash: hash});
            user.save(function(err){
                if (err) return res.status(500).end(err);
                return res.json(username);
            });
        });
    });
});

app.post('/signin/', function(req, res, next){
    let username = req.body.username;
    let password = req.body.password;
    User.findById(username, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(401).end("access denied");
        bcrypt.compare(password, user.hash, function(err, valid){
            if (err) return res.status(500).end(err);
            if (!valid) return res.status(401).end("access denied");
            // initialize cookie
            req.session.user = user;
            res.setHeader('Set-Cookie', cookie.serialize('username', user._id, {
                  path : '/',
                  maxAge: 60 * 60 * 24 * 7
            }));
            return res.json(username);
        });
    });
});

app.get('/signout/', function (req, res, next) {
    // When user signs out, destroy current session and clear stored username cookie
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/',
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    return res.json("terminated");
});

const http = require('http');
const PORT = 8000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});
