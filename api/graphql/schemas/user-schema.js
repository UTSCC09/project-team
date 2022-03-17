const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInputObjectType,
    GraphQLUnionType,
} = require('graphql');
const resolver = require('../../db/resolvers/user-resolver');

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

const errorUserType = new GraphQLObjectType({
    name: 'errorUser',
    fields: {
        message: {type: GraphQLString}
    }
});

const userResultType = new GraphQLUnionType({
    name: 'UserResult',
    types: [userType, errorUserType],
    resolveType: (value) => {
        if (value.username) return userType.name;
        if (value.message) return errorUserType.name;
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
            resolve: (_, {input}) => resolver.signin(input)
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
