const User = require('../models/user-model');
const cookie = require('cookie');
const { DupelicateError, AuthenticationError } = require('../../graphql/schemas/error-schema')
const bcrypt = require('bcrypt');
const saltRounds = 10;

createUser = async function (input, context) {
  const hash = await bcrypt.hash(input.password, saltRounds);
  var user = await new User({username: input.username, password: hash}).save().then(usr => user = usr).catch(err => error = err);
  if (user && user.code == 11000) return DupelicateError(input.username);
  context.req.session.user = user;
  context.res.setHeader('Set-Cookie', cookie.serialize('username', user.username, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7
  }));
  return ({'username': user.username, 'password': input.password});
};

signin = async function (input, context) {
    const user = await User.findOne({username: input.username}).exec();
    if (!user) return AuthenticationError();
    const valid = await bcrypt.compare(input.password, user.password);
    console.log(valid);
    if (!valid) return AuthenticationError();
    context.req.session.user = user;
    context.res.setHeader('Set-Cookie', cookie.serialize('username', user.username, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7
    }));
    return ({'username': user.username, 'password': input.password});
}

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
