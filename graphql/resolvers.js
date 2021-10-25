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
		async login(_, { loginInput: { email, password } }) {
			const user = await User.findOne({ username: email });
			console.log('login attempt heard on server');
			if (!user) {
				throw (
					(new UserInputError('user does not exist'),
					{
						errors: {
							email: 'This email does not have an account',
						},
					})
				);
			}

			const match = await bcrypt.compare(password, user.password);

			if (!match) {
				throw (
					(new UserInputError('Wrong Credentials'),
					{
						errors: {
							password: 'The password you entered in not correct',
						},
					})
				);
			}

			const token = generateToken(user);

			return {
				...user._doc,
				id: user._id,
				token,
			};
		},
		async register(
			_,
			{ registerInput: { displayName, email, password, confirmPassword } }
		) {
			const user = await User.findOne({ username: email });
			console.log('The server heard');

			if (user) {
				throw new UserInputError('This email address is already registered', {
					errors: {
						email: 'This username is taken',
					},
				});
			}

			if (password === confirmPassword) {
				password = await bcrypt.hash(password, 12);

				const newUser = new User({
					username: email,
					password,
					email,
					displayName,
				});

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
