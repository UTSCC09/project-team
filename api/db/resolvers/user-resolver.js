const User = require('../models/user-model');

createUser = async function (input) {
  var user = await new User(input).save().then(usr => user = usr).catch(err => error = err);
  if (user?.code == 11000) return { message: "Username " + input.username + " already exists" };
  return user;
};

signin = async function (input) {
  console.log(input);
  const user = await User.findOne(input).exec();
  if (!user) return { message: "No user found" };
  return user;
}

module.exports = {
  createUser,
  signin
}