const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInputObjectType,
    GraphQLUnionType,
} = require('graphql');
const resolver = require('../../db/resolvers/user-resolver');
const {ErrorType} = require('./error-schema');

const userInputType = new GraphQLInputObjectType({
    name: 'UserInput',
    fields: {
        username: {type: GraphQLString},
        password: {type: GraphQLString}
    }
});

const userType = new GraphQLObjectType({
    name: 'User',
    fields: {
        username: {type: GraphQLString},
        password: {type: GraphQLString}
    },
});

const userResultType = new GraphQLUnionType({
    name: 'UserResult',
    types: [userType, ErrorType],
    resolveType: (value) => {
        if (value.username) return userType.name;
        if (value.message) return ErrorType.name;
    }
});

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        signin: {
            type: userResultType,
            args: {
                input: {type: userInputType}
            },
            resolve: (_, {input}, context) => resolver.signin(input, context)
        }
    }
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createUser: {
            type: userResultType,
            args: {
                input: {type: userInputType}
            },
            resolve: (_, {input}) => resolver.createUser(input)
        }
    }
})

let schema = new GraphQLSchema({query: queryType, mutation: mutationType});

module.exports = {
    schema
}
