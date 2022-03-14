const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    buildSchema
} = require('graphql');

let schema = buildSchema(`
    input UserInput {
        username: String
        password: String
    }

    type User {
        username: String
        password: String
    }

    type Mutation {
        createUser(input: UserInput): User
    }

    type Query {
        signin(input: UserInput): User
    }

`);

module.exports = {
    schema
}
