const { gql } = require('apollo-server-express');

module.exports = gql`
	type User {
		id: ID!
		username: String!
		email: String!
		token: String!
		createdAt: String!
	}

	input RegisterInput {
		username: String!
		email: String!
		password: String!
		confirmPassword: String!
	}

	# Query and mutation must be present to run GQL server
	type Query {
		getUser(userId: ID!): User
	}

	type Mutation {
		register(registerInput: RegisterInput): User!
	}
`;
