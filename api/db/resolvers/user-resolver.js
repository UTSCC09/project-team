const User = require('../models/user-model');

createUser = function ({input}) {
  const user = new User(input);
  return user.save();
};

signin = async function ({input}) {
  const user = await User.findOne(input).exec();
  return user;
}

module.exports = {
  createUser,
  signin
}