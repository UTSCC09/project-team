const User = require('../models/user-model');

createUser = async function ({input}) {
  const user = await new User(input).save();
  return user;
};

signin = async function ({input}) {
  const user = await User.findOne(input).exec();
  return user;
}

module.exports = {
  createUser,
  signin
}