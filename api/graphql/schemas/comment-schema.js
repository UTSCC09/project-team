const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLFloat,
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLUnionType,
    buildSchema
} = require('graphql');
const resolver = require('../../db/resolvers/comment-resolver');
const {ErrorType} = require('./error-schema');

const commentSearch = new GraphQLInputObjectType({
    name: 'CommentSearchInput',
    fields: {
        IId: {type: GraphQLString}
    }
});

const commentInput = new GraphQLInputObjectType({
    name: 'CommentInput',
    fields: {
        IId: {type: GraphQLString},
        createdBy: {type: GraphQLString},
        content: {type: GraphQLString}
    }
});

const commentType = new GraphQLObjectType({
    name: 'Comment',
    fields: {
        _id: {type: GraphQLString},
        IId: {type: GraphQLString},
        createdBy: {type: GraphQLString},
        content: {type: GraphQLString}
    }
});

const commentMultipleType = new GraphQLObjectType({
    name: 'Comments',
    fields: {
        comments: {type: new GraphQLList(commentType)}
    }
});

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getComments: {
            type: commentMultipleType,
            args: {commentSearch},
            resolve: (_, {input}) => resolver.getComments(input)
        }
    }
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createComment: {
            type: commentType,
            args: {commentInput},
            resolve: (_, {input}) => resolver.createComment(input)
        },
    }
});

let schema = new GraphQLSchema({query: queryType, mutation: mutationType});

module.exports = {
  schema
}
