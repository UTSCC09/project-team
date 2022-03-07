const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    buildSchema
} = require('graphql');


let schema = buildSchema(`
    input LocationInput {
        type: String
        features: FeatureInput
    }

    input FeatureInput {
        type: String
        geometry: GeometryInput
    }

    input GeometryInput {
        type: String
        coordinates: [CoordinateInput]
    }

    input CoordinateInput {
        lat: Float
        lon: Float
    }

    input idInput {
        _id: String
    }

    type Location {
        type: String
        features: Features
        _id: String
    }

    type Features {
        type: String
        geometry: Geometry
    }

    type Geometry {
        type: String
        coordinates: [Coordinate]
    }

    type Coordinate {
        lat: Float
        lon: Float
    }

    type Mutation {
        createLocation(input: LocationInput): Location
    }

    type Query {
        getLocation(input: idInput): Location
    }

`);

module.exports = {
    schema,
}
