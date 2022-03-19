const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  buildSchema
} = require('graphql');

let schema = buildSchema(`
  input CommentInput {
    content: String
    lId: String
    createdBy: String
  }

  input CommentSearch {
    lId: String
  }

  type Comment {
    _id: String
    content: String
    lId: String
    createdBy: String
  }

  type Mutation {
      createComment(input: CommentInput): Comment
  }

  type Query {
      getComments(input: CommentSearch): [Comment]
  }

`);

module.exports = {
  schema
}
