const User = require('../models/user-model');
const cookie = require('cookie');
const { DupelicateError, AuthenticationError } = require('../../graphql/schemas/error-schema')

createUser = async function (input) {
  var user = await new User(input).save().then(usr => user = usr).catch(err => error = err);
  if (user && user.code == 11000) return DupelicateError();
  return user;
};

signin = async function (input, context) {
  const user = await User.findOne(input).exec();
  if (!user) return AuthenticationError();
  context.req.session.user = user;
  context.res.setHeader('Set-Cookie', cookie.serialize('username', user.username, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7
  }));
  return user;
}

module.exports = {
  createUser,
  signin
}