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
    pinMultipleResultType
} = require('./pin-schema');
const resolver = require('../../db/resolvers/polygon-resolver');
const {ErrorType, stringResultType} = require('./error-schema');

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
        coordinates: {type: new GraphQLList(new GraphQLList(new GraphQLList(GraphQLFloat)))}
    }
});

const propertyInput = new GraphQLInputObjectType({
    name: 'PropertyInput',
    fields: {
        name: {type: GraphQLString},
        description: {type: GraphQLString},
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

const polygonInput = new GraphQLInputObjectType({
    name: 'PolygonInput',
    fields: {
        type: {type: GraphQLString},
        features: {type: featureInput}
    }
});

const searchInput = new GraphQLInputObjectType({
    name: 'SearchInput',
    fields: {
        lat: {type: GraphQLFloat},
        lon: {type: GraphQLFloat},
        radius: {type: GraphQLFloat},
    }
});

const polygonPropertyType = new GraphQLObjectType({
    name: 'PolygonProperty',
    fields: {
        name: {type: GraphQLString},
        description: {type: GraphQLString},
    }
});

const polygonGeometryType = new GraphQLObjectType({
    name: 'PolygonGeometry',
    fields: {
        type: {type: GraphQLString},
        coordinates: {type: new GraphQLList(new GraphQLList(new GraphQLList(GraphQLFloat)))}
    }
});

const polygonFeatureType = new GraphQLObjectType({
    name: 'PolygonFeature',
    fields: {
        type: {type: GraphQLString},
        properties: {type: polygonPropertyType},
        geometry: {type: polygonGeometryType}
    }
});

const polygonType = new GraphQLObjectType({
    name: 'Polygon',
    fields: {
        _id: {type: GraphQLString},
        type: {type: GraphQLString},
        features: {type: polygonFeatureType},
        owner: {type: GraphQLString}
    }
});

const polygonResultType = new GraphQLUnionType({
    name: 'PolygonResult',
    types: [polygonType, ErrorType],
    resolveType: (value) => {
        if (value._id) return polygonType.name;
        if (value.message) return ErrorType.name;
    }
});

const polygonMultipleType = new GraphQLObjectType({
    name: 'Polygons',
    fields: {
        polygons: {type: new GraphQLList(polygonType)}
    }
});

const polygonMultipleResultType = new GraphQLUnionType({
    name: 'PolygonMultipleResult',
    types: [polygonMultipleType, ErrorType],
    resolveType: (value) => {
        return value.message? ErrorType.name : polygonMultipleType.name;
    }
})

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getNear: {
            type: polygonMultipleResultType,
            args: {
                input: {type: searchInput}
            },
            resolve: (_, {input}, context) => resolver.getNear(input, context)
        }
    }
});

const idQueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getPinsWithin: {
            type: pinMultipleResultType,
            args: {},
            resolve: (_, {input}, context) => resolver.getPinsWithin(input, context)
        },
    }
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createPolygon: {
            type: polygonResultType,
            args: {
                input: {type: polygonInput}
            },
            resolve: (_, {input}, context) => resolver.createPolygon(input, context)
        },
    }
});

const idMutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        deletePolygon: {
            type: stringResultType,
            args: {},
            resolve: (_, {input}, context) => resolver.deletePolygon(input, context)
        }
    }
});

let schema = new GraphQLSchema({query: queryType, mutation: mutationType});

let idSchema = new GraphQLSchema({query: idQueryType, mutation: idMutationType});

module.exports = {
    schema,
    idSchema
}
