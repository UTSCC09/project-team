const {
  GraphQLObjectType,
  GraphQLString,
} = require('graphql');

const ErrorType = new GraphQLObjectType({
  name: 'Error',
  fields: {
    message: { type: GraphQLString }
  }
});

const NotFoundError = function (missingValue) {
  return { message: missingValue + ' not found' };
}

const DupelicateError = function (dupelicateValue) {
  return { message: dupelicateValue + ' already exists' };
}

const AuthorizationError = function () {
  return { message: "User not authorized" };
}

const AuthenticationError = function () {
  return { message: "Authentication failed" };
}

const UserInputError = function (inputValue) {
    return {message: inputValue + ' not accepted'};
}

module.exports = {
  ErrorType,
  NotFoundError,
  AuthorizationError,
  AuthenticationError,
  DupelicateError,
  UserInputError
}
