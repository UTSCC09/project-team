const Location = require('../models/location-model');

createLocation = async function ({input}) {
  const location = await new Location(input).save();
  console.log(location._id);
  console.log(location, "location");
  return location;
};

getLocation = async function ({input}) {
    const location = await Location.findOne(input).exec();
    return location;
}

module.exports = {
  createLocation,
  getLocation
}
