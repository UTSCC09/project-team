const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    buildSchema
} = require('graphql');


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

    type Pin {
        _id: String
        type: String
        features: featureSchema
    }

    type featureSchema {
        type: String
        properties: propertySchema
        geometry: geometrySchema
    }

    type geometrySchema {
        type: String
        coordinates: [Float]
    }

    type propertySchema {
        name: String
    }

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
}
