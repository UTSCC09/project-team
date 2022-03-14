const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  buildSchema
} = require('graphql');

let schema = buildSchema(`
  input RatingInput {
    stars: Int
    lId: String
    createdBy: String
    review: String
  }

  input RatingSearch {
    lId: String
  }

  type Rating {
    _id: String
    stars: Int
    lId: String
    createdBy: String
    review: String
  }

  type Mutation {
      createRating(input: RatingInput): Rating
      updateRating(input: RatingInput): Rating
  }

  type Query {
      getRatings(input: RatingSearch): [Rating]
  }

`);

module.exports = {
  schema
}
