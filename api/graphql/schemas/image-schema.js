const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    buildSchema
} = require('graphql');

let schema = buildSchema(`
    scalar Upload

    input ImageInput {
        image: Upload!
        title: String
    }

    type Image {
        _id: String
        title: String
        image: String
        pin: String
    }

    type Photo {
        url: String
    }

    input idInput {
        _id: String
    }

    type Mutation {
        createImage(input: ImageInput): Image
        deleteImage: Image
    }

    type Query {
        getImages: [Image]
        getPhoto: Photo
    }
`);

module.exports = {
    schema
}
