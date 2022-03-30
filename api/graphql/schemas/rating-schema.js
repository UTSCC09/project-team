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
        lId: {type: GraphQLString}
    }
});

const ratingInput = new GraphQLInputObjectType({
    name: 'RatingInput',
    fields: {
        stars: {type: GraphQLInt},
        lId: {type: GraphQLString},
        review: {type: GraphQLString}
    }
});

const ratingType = new GraphQLObjectType({
    name: 'Rating',
    fields: {
        _id: {type: GraphQLString},
        stars: {type: GraphQLInt},
        lId: {type: GraphQLString},
        createdBy: {type: GraphQLString},
        review: {type: GraphQLString}
    }
});

const ratingMultipleType = new GraphQLObjectType({
    name: 'Ratings',
    fields: {
        ratings: {type: new GraphQLList(ratingType)},
        average: {type: GraphQLFloat}
    }
});

const ratingSearchResultType = new GraphQLUnionType({
    name: 'RatingSearchResult',
    types: [ratingMultipleType, ErrorType],
    resolveType: (value) => {
        return value.message ? ErrorType.name : ratingMultipleType.name;
    }
});

const ratingResultType = new GraphQLUnionType({
    name: 'RatingResult',
    types: [ratingType, ErrorType],
    resolveType: (value) => {
        return value.message ? ErrorType.name : ratingType.name;
    }
});

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getRatings: {
            type: ratingSearchResultType,
            args: {
                input: {type: ratingSearch}
            },
            resolve: (_, {input}) => resolver.getRatings(input)
        }
    }
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createRating: {
            type: ratingResultType,
            args: {
                input: {type: ratingInput}
            },
            resolve: (_, {input}, context) => resolver.createRating(input, context)
        },
        updateRating: {
            type: ratingResultType,
            args: {
                input: {type: ratingInput}
            },
            resolve: (_, {input}, context) => resolver.updateRating(input, context)
        }
    }
});

let schema = new GraphQLSchema({query: queryType, mutation: mutationType});

module.exports = {
  schema
}
