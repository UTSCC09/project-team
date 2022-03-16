const User = require('../models/user-model');
const cookie = require('cookie');

createUser = async function ({input}, req) {
  const user = await new User(input).save();
  return user;
};

signin = async function ({input}, context) {
  const user = await User.findOne(input).exec();
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
