const { gql } = require('apollo-server-express');

module.exports = gql`
	type User {
		id: ID!
		displayName: String!
		username: String!
		email: String!
		token: String!
		createdAt: String!
	}

	input RegisterInput {
		displayName: String!
		email: String!
		password: String!
		confirmPassword: String!
	}

	input LoginInput {
		email: String!
		password: String!
	}

	# Query and mutation must be present to run GQL server
	type Query {
		getUser(userId: ID!): User
	}

	type Mutation {
		register(registerInput: RegisterInput): User!
		login(loginInput: LoginInput): User!
	}
`;
