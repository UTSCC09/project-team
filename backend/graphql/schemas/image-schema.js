const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLFloat,
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLUnionType,
    buildSchema,
    GraphQLEnumType
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

const goToEnum = new GraphQLEnumType({
    name: 'GoToEnum',
    values: {
        OLDEST: {
            value: resolver.GoToEnum.oldest
        },
        NEWEST: {
            value: resolver.GoToEnum.newest
        }
    }
})

const imagePageInput = new GraphQLInputObjectType({
    name: 'ImagePageInput',
    fields: {
        goto: {type: goToEnum}
    }
})

const imageAdjacentInput = new GraphQLInputObjectType({
    name: 'ImageAdjacentInput',
    fields: {
        imageId: {type: GraphQLString}
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

const imageAdjacentType = new GraphQLObjectType({
    name: 'ImageAdjacent',
    fields: {
        previous: {type: imageType},
        next: {type: imageType}
    }
});

const imageResultType = new GraphQLUnionType({
    name: 'ImageResult',
    types: [imageType, ErrorType],
    resolveType: (value) => {
        return value.message ? ErrorType.name : imageType.name;
    }
});

const imageMultipleResultType = new GraphQLUnionType({
    name: 'ImageMultipleResult',
    types: [imageMultipleType, ErrorType],
    resolveType: (value) => {
        return value.message? ErrorType.name : imageMultipleType.name;
    }
})

const imageAdjacentResultType = new GraphQLUnionType({
    name: 'ImagePageResult',
    types: [imageAdjacentType, ErrorType],
    resolveType: (value) => {
        return value.message ? ErrorType.name : imageAdjacentType.name;
    }
});

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

        getImagePage: {
            type: imageResultType,
            args: {
                input: {type: imagePageInput}
            },
            resolve: (_, {input}, context) => resolver.getImagePage(input, context)
        },

        getAdjacentImage: {
            type: imageAdjacentResultType,
            args: {
                input: {type: imageAdjacentInput}
            },
            resolve: (_, {input}, context) => resolver.getAdajcentImage(input, context)
        }
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
