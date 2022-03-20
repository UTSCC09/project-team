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
    return (req.session.user == creator)? null : AuthorizationError;
};

module.exports = {
    isAuthenticated,
    isAuthorized
};
