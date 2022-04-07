const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInputObjectType,
    GraphQLUnionType,
    GraphQLNonNull
} = require('graphql');
const resolver = require('../../db/resolvers/user-resolver');
const {ErrorType, stringResultType} = require('./error-schema');

const userInputType = new GraphQLInputObjectType({
    name: 'UserInput',
    fields: {
        username: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)}
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
        },
        signout: {
            type: stringResultType,
            args: {},
            resolve: (_, {input}, context) => resolver.signout(input, context)
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
            resolve: (_, {input}, context) => resolver.createUser(input, context)
        },
    }
})

let schema = new GraphQLSchema({query: queryType, mutation: mutationType});

module.exports = {
    schema
}
