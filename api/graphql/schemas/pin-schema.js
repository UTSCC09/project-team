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
const resolver = require('../../db/resolvers/pin-resolver');
const {ErrorType, stringResultType} = require('./error-schema');

const {
    GraphQLUpload,
} = require('graphql-upload');

const idInput = new GraphQLInputObjectType({
    name: 'IdInput',
    fields: {
        _id: {type: GraphQLString},
    }
});

const geometryInput = new GraphQLInputObjectType({
    name: 'GeometryInput',
    fields: {
        type: {type: GraphQLString},
        coordinates: {type: new GraphQLList(GraphQLFloat)}
    }
});

const propertyInput = new GraphQLInputObjectType({
    name: 'PropertyInput',
    fields: {
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        tags: {type: new GraphQLList(GraphQLString)}
    }
});

const featureInput = new GraphQLInputObjectType({
    name: 'FeatureInput',
    fields: {
        type: {type: GraphQLString},
        properties: {type: propertyInput},
        geometry: {type: geometryInput}
    }
});

const pinInput = new GraphQLInputObjectType({
    name: 'PinInput',
    fields: {
        type: {type: GraphQLString},
        features: {type: featureInput}
    }
});

const tagInput = new GraphQLInputObjectType({
    name: 'TagInput',
    fields: {
        tag: {type: GraphQLString},
    }
});


const searchInput = new GraphQLInputObjectType({
    name: 'SearchInput',
    fields: {
        lat: {type: GraphQLFloat},
        lon: {type: GraphQLFloat},
        radius: {type: GraphQLFloat},
        tags: {type: new GraphQLList(GraphQLString)},
        message: {type: GraphQLString},
        speech: {type: GraphQLUpload},
    }
});


const pinPropertyType = new GraphQLObjectType({
    name: 'PinProperty',
    fields: {
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        tags: {type: new GraphQLList(GraphQLString)}
    }
});

const pinGeometryType = new GraphQLObjectType({
    name: 'PinGeometry',
    fields: {
        type: {type: GraphQLString},
        coordinates: {type: new GraphQLList(GraphQLFloat)}
    }
});

const pinFeatureType = new GraphQLObjectType({
    name: 'PinFeature',
    fields: {
        type: {type: GraphQLString},
        properties: {type: pinPropertyType},
        geometry: {type: pinGeometryType}
    }
});

const pinType = new GraphQLObjectType({
    name: 'Pin',
    fields: {
        _id: {type: GraphQLString},
        type: {type: GraphQLString},
        features: {type: pinFeatureType},
        owner: {type: GraphQLString}
    }
});

const pinMultipleType = new GraphQLObjectType({
    name: 'Pins',
    fields: {
        pins: {type: new GraphQLList(pinType)},
        tags: {type: new GraphQLList(GraphQLString)}
    }
});

const pinResultType = new GraphQLUnionType({
    name: 'PinResult',
    types: [pinType, ErrorType],
    resolveType: (value) => {
        if (value._id) return pinType.name;
        if (value.message) return ErrorType.name;
    }
});

const pinMultipleResultType = new GraphQLUnionType({
    name: 'PinMultipleResult',
    types: [pinMultipleType, ErrorType],
    resolveType: (value) => {
        console.log(value);
        return value.message? ErrorType.name : pinMultipleType.name;
    }
})

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getNear: {
            type: pinMultipleResultType,
            args: {
                input: {type: searchInput}
            },
            resolve: (_, {input}, context) => resolver.getNear(input, context)
        },
        listPins: {
            type: pinMultipleResultType,
            args: {},
            resolve: (_, {input}, context) => resolver.listPins(context)
        },
        searchByTag: {
            type: pinMultipleResultType,
            args: {
                input: {type: searchInput}
            },
            resolve: (_, {input}, context) => resolver.searchPinByTag(input, context)
        }
    }
});

const idQueryType = new GraphQLObjectType({
    name: 'Query',
    fields:{
        getPin: {
            type: pinResultType,
            args: {},
            resolve: (_, {input}, context) => resolver.getPin(context)
        },
    }
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createPin: {
            type: pinResultType,
            args: {
                input: {type: pinInput}
            },
            resolve: (_, {input}, context) => resolver.createPin(input, context)
        },
    }
});

const idMutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        deletePin: {
            type: stringResultType,
            args: {},
            resolve: (_, {input}, context) => resolver.deletePin(input, context)
        },
        addTag: {
            type: pinResultType,
            args: {
                input: {type: tagInput}
            },
            resolve: (_, {input}, context) => resolver.addTag(input, context)
        },
        deleteTag: {
            type: pinResultType,
            args: {
                input: {type: tagInput}
            },
            resolve: (_, {input}, context) => resolver.deleteTag(input, context)
        }
    }
});

let schema = new GraphQLSchema({query: queryType, mutation: mutationType});

let idSchema = new GraphQLSchema({query: idQueryType, mutation: idMutationType})

module.exports = {
    schema,
    pinMultipleResultType,
    idSchema
}
