const User = require('../models/user-model');
const cookie = require('cookie');
const { DupelicateError, AuthenticationError, UserInputError } = require('../../graphql/schemas/error-schema')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {checkInput} = require('../../util');

// Create user in database if inputs are valid
createUser = async function (input) {
    let bad_input = checkInput(input.username);
    if (bad_input) return bad_input(input.username);
    bad_input = checkInput(input.password);
    if (bad_input) return bad_input(input.password);

    // Check password within acceptable length
    if (input.password.length < 8 || input.password.length > 16) {
        return UserInputError(input.password);
    }

    // Hash password
    const hash = await bcrypt.hash(input.password, saltRounds);
    var user = await new User({username: input.username, password: hash}).save().then(usr => user = usr).catch(err => error = err);
    if (user && user.code == 11000) return DupelicateError(input.username);
    return ({'username': user.username, 'password': input.password});
};

// Create user session if inputs match existing database entry
signin = async function (input, context) {
    let bad_input = checkInput(input.username);
    if (bad_input) return bad_input(input.username);
    bad_input = checkInput(input.password);
    if (bad_input) return bad_input(input.password);

    const user = await User.findOne({username: input.username}).exec();
    if (!user) return AuthenticationError();
    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) return AuthenticationError();
    context.req.session.user = user;
    context.res.setHeader('Set-Cookie', cookie.serialize('username', user.username, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7
    }));
    return ({'username': user.username, 'password': input.password});
}

// Destroy user session
signout = function (input, context) {
    // When user signs out, destroy current session and clear stored username cookie
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/',
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    return ({"return": "terminated"});
}

module.exports = {
  createUser,
  signin,
  signout
}
