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

// Capitalize first character of a string
const capitalizeFirst = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Check if input if alphanumberic, return error if not
const checkInput = function (input) {
    if (!validator.isAlphanumeric(input)) return UserInputError;
};

// Sanitize inputs by removing special characters, replacing with HTML entity
const sanitizeInput = function(input) {
    let cleanInput = null;
    // Use recursion to sanitize all elements in a dictionary
    if (isDict(input)) {
        cleanInput = {};
        for (const [key, value] of Object.entries(input)) {
            cleanInput[key] = sanitizeInput(value);
        }
    }
    // Use recursion to sanitize all elements in an array
    else if (input instanceof Array) {
        cleanInput = [];
        for (const elem of input) {
            cleanInput.push(sanitizeInput(elem));
        }
    }
    // Replace special characters with HTML entities
    else if (typeof input === 'string' || input instanceof String) {
        cleanInput = validator.escape(input);
        cleanInput = cleanInput.replace("(", "&lpar;");
        cleanInput = cleanInput.replace(")", "&rpar;");
    }
    // Ignore numbers for replacement
    else if (isNumber(input)) {
        cleanInput = input;
    }
    return cleanInput;
}

// Check if input is a dictionary
const isDict = function(input) {
    return typeof input == 'object' && input != null && !(input instanceof Array);
}

// Check if input is a number
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
