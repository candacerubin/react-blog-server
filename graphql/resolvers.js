const User = require('../models/User');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { SECRET_KEY } = require('../config');
const { UserInputError } = require('apollo-server-express');

const generateToken = (user) =>
	jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		SECRET_KEY,
		{ expiresIn: '1hr' }
	);

module.exports = {
	// Query and mutation must be present; define queries and mutations from typeDef; can leave empty until ready to write
	Query: {
		async getUser(_, { userId }) {
			const user = await User.findById(userId);
			if (user) {
				return user;
			}
		},
	},
	Mutation: {
		async register(
			_,
			{ registerInput: { username, email, password, confirmPassword } }
		) {
			const user = await User.findOne({ username });

			if (user) {
				throw new UserInputError('This username is already in use', {
					errors: {
						username: 'This username is taken',
					},
				});
			}

			if (password === confirmPassword) {
				password = await bcrypt.hash(password, 12);

				const newUser = new User({ username, password, email });

				const res = await newUser.save();
				const token = generateToken(res);
				return {
					...res._doc,
					id: res._id,
					token,
				};
			} else {
				throw new UserInputError('The passwords do not match', {
					errors: {
						password: 'Passwords do not match',
					},
				});
			}
		},
	},
};
