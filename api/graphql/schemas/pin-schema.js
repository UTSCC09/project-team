const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    buildSchema
} = require('graphql');

const pinType = `
    type Pin {
        _id: String
        type: String
        features: pinFeatureSchema
    }

    type pinFeatureSchema {
        type: String
        properties: pinPropertySchema
        geometry: pinGeometrySchema
    }

    type pinGeometrySchema {
        type: String
        coordinates: [Float]
    }

    type pinPropertySchema {
        name: String
    }
`;

let schema = buildSchema(`
    input pinInput {
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
        coordinates: [Float]
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
    ` + pinType +
    `
    type Mutation {
        createPin(input: pinInput): Pin
    }

    type Query {
        getPin(input: idInput): Pin
        getNear(input: searchInput): [Pin]
        listPins(input: idInput): [Pin]
    }

`);

module.exports = {
    schema,
    pinType
}
