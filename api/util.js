const {
    DupelicateError,
    AuthenticationError,
    AuthorizationError
} = require('./graphql/schemas/error-schema')

// Check if session exists
const isAuthenticated = function (req) {
    return req.username? null : AuthenticationError;
};

// Check if user has perms
const isAuthorized = function (req, creator) {
    return (req.session.user._id == creator.toString())? null : AuthorizationError;
};

const capitalizeFirst = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    isAuthenticated,
    isAuthorized,
    capitalizeFirst
};
