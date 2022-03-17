const User = require('../models/user-model');
const cookie = require('cookie');

createUser = async function (input) {
  var user = await new User(input).save().then(usr => user = usr).catch(err => error = err);
  if (user && user.code == 11000) return { message: "Username  already exists" };
  return user;
};

signin = async function (input) {
  const user = await User.findOne(input).exec();
  if (!user) return { message: "No user found" };
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
