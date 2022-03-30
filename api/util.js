const {
    DupelicateError,
    AuthenticationError,
    AuthorizationError,
    UserInputError
} = require('./graphql/schemas/error-schema')
const validator = require('validator');

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

const checkInput = function (input) {
    if (!validator.isAlphanumeric(input)) return UserInputError;
};

const sanitizeInput = function(input) {
    let cleanInput = null;
    if (isDict(input)) {
        cleanInput = {};
        for (const [key, value] of Object.entries(input)) {
            cleanInput[key] = sanitizeInput(value);
        }
    }
    else if (input instanceof Array) {
        cleanInput = [];
        for (const elem of input) {
            cleanInput.push(sanitizeInput(elem));
        }
    }
    else if (typeof input === 'string' || input instanceof String) {
        cleanInput = validator.escape(input);
        cleanInput = cleanInput.replace("(", "&lpar;");
        cleanInput = cleanInput.replace(")", "&rpar;");
    }
    else if (isNumber(input)) {
        cleanInput = input;
    }
    return cleanInput;
}

const isDict = function(input) {
    return typeof input == 'object' && input != null && !(input instanceof Array);
}

const isNumber = function(input) {
    return (Number(input) == input);
}

module.exports = {
    isAuthenticated,
    isAuthorized,
    capitalizeFirst,
    checkInput,
    sanitizeInput
};
