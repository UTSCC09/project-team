const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLFloat,
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLUnionType,
    GraphQLInt,
    buildSchema
} = require('graphql');
const resolver = require('../../db/resolvers/rating-resolver');
const {ErrorType} = require('./error-schema');

const ratingSearch = new GraphQLInputObjectType({
    name: 'RatingSearchInput',
    fields: {
        IId: {type: GraphQLString}
    }
});

const ratingInput = new GraphQLInputObjectType({
    name: 'RatingInput',
    fields: {
        stars: {type: GraphQLInt},
        IId: {type: GraphQLString},
        createdBy: {type: GraphQLString},
        review: {type: GraphQLString}
    }
});

const ratingType = new GraphQLObjectType({
    name: 'Rating',
    fields: {
        _id: {type: GraphQLString},
        stars: {type: GraphQLInt},
        IId: {type: GraphQLString},
        createdBy: {type: GraphQLString},
        review: {type: GraphQLString}
    }
});

const ratingMultipleType = new GraphQLObjectType({
    name: 'Ratings',
    fields: {
        ratings: {type: new GraphQLList(ratingType)}
    }
});

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getRatings: {
            type: ratingMultipleType,
            args: {ratingSearch},
            resolve: (_, {input}) => resolver.getRatings(input)
        }
    }
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createRating: {
            type: ratingType,
            args: {ratingInput},
            resolve: (_, {input}) => resolver.createRating(input)
        },
        updateRating: {
            type: ratingType,
            args: {ratingInput},
            resolve: (_, {input}) => resolver.updateRating(input)
        }
    }
});

let schema = new GraphQLSchema({query: queryType, mutation: mutationType});

module.exports = {
  schema
}
