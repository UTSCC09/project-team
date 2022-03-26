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

const {
    GraphQLUpload,
} = require('graphql-upload');

const resolver = require('../../db/resolvers/image-resolver');
const {ErrorType} = require('./error-schema');

const idInput = new GraphQLInputObjectType({
    name: 'IdInput',
    fields: {
        _id: {type: GraphQLString},
    }
});

const imageInput = new GraphQLInputObjectType({
    name: 'ImageInput',
    fields: {
        image: {type: GraphQLUpload},
        title: {type: GraphQLString},
    }
});

const imageType = new GraphQLObjectType({
    name: 'Image',
    fields: {
        _id: {type: GraphQLString},
        title: {type: GraphQLString},
        image: {type: GraphQLString},
        pin: {type: GraphQLString}
    }
});

const imageMultipleType = new GraphQLObjectType({
    name: 'Images',
    fields: {
        images: {type: new GraphQLList(imageType)}
    }
});

const imageResultType = new GraphQLUnionType({
    name: 'ImageResult',
    types: [imageType, ErrorType],
    resolveType: (value) => {
        if (value._id) return imageType.name;
        if (value.message) return ErrorType.name;
    }
});

const imageMultipleResultType = new GraphQLUnionType({
    name: 'ImageMultipleResult',
    types: [imageMultipleType, ErrorType],
    resolveType: (value) => {
        return value.message? ErrorType.name : imageMultipleType.name;
    }
})

const photoType = new GraphQLObjectType({
    name: 'Photo',
    fields: {
        url: {type: GraphQLString}
    }
});

const photoResultType = new GraphQLUnionType({
    name: 'PhotoResult',
    types: [photoType, ErrorType],
    resolveType: (value) => {
        if (value.url) return photoType.name;
        if (value.message) return ErrorType.name;
    }
});

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getImages: {
            type: imageMultipleResultType,
            args: {},
            resolve: (_, {input}, context) => resolver.getImages(context)
        },
    }
})

const photoQueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getPhoto: {
            type: photoResultType,
            args: {},
            resolve: (_, {input}, context) => resolver.getPhoto(context)
        }
    }
})

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createImage: {
            type: imageResultType,
            args: {
                input: {type: imageInput}
            },
            resolve: (_, {input}, context) => resolver.createImage(input, context)
        },
        deleteImage: {
            type: imageResultType,
            args: {},
            resolve: (_, {input}, context) => resolver.deleteImage(context)
        }
    }
})

let schema = new GraphQLSchema({query: queryType, mutation: mutationType});

let photoSchema = new GraphQLSchema({query: photoQueryType});

module.exports = {
    schema,
    photoSchema
}
