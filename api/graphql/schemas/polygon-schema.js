const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    buildSchema
} = require('graphql');

const pinType = require('./pin-schema').pinType;

const polygonType = `
    type Polygon {
        _id: String
        type: String
        features: polygonFeatureSchema
    }

    type polygonFeatureSchema {
        type: String
        properties: polygonPropertySchema
        geometry: polygonGeometrySchema
    }

    type polygonGeometrySchema {
        type: String
        coordinates: [[[Float]]]
    }

    type polygonPropertySchema {
        name: String
    }
`;

let schema = buildSchema(pinType + polygonType + `
    input polygonInput {
        type: String
        features: featureInput
    }

    input featureInput {
        type: String
        properties: propertyInput
        geometry: geometryInput
    }

    input geometryInput {
        type: String
        coordinates: [[[Float]]]
    }

    input propertyInput {
        name: String
    }

    input idInput {
        _id: String
    }

    input searchInput {
        lat: Float
        lon: Float
        radius: Float
    }
    
    type Mutation {
        createPolygon(input: polygonInput): Polygon
    }

    type Query {
        getPolygon(input: idInput): Polygon
        listPolygons(input: idInput): [Polygon]
        getPinsWithin(input: idInput): [Pin]
        getNear(input: searchInput): [Polygon]
    }

`);

module.exports = {
    schema,
}
