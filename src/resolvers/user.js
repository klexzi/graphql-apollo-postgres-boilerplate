import jwt from 'jsonwebtoken';
import { combineResolvers } from 'graphql-resolvers';
import { AuthenticationError, UserInputError } from 'apollo-server';

import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { isAdmin, isAuthenticated } from './authorization';
import {
  UserType,
  UserLoginInputType,
  UserSignupInputType,
  UserTokenType,
} from '../types';
import { User } from '../models';

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, role } = user;
  return jwt.sign({ id, email, username, role }, secret, {
    expiresIn,
  });
};

export default {
  Query: {
    users: {
      type: new GraphQLList(UserType),
      resolve: async () => {
        return User.findAll();
      },
    },
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: async (parent, { id }) => {
        return User.findById(id);
      },
    },
    me: {
      type: UserType,
      resolve: async (parent, args, { me }) => {
        if (!me) {
          return null;
        }
        return User.findById(me.id);
      },
    },
  },

  Mutation: {
    signUp: {
      type: UserTokenType,
      args: { input: { type: UserSignupInputType } },
      resolve: async (
        parent,
        { input: { username, email, password } },
        { secret },
      ) => {
        const user = await User.create({
          username,
          email,
          password,
        });

        return { token: createToken(user, secret, '30m') };
      },
    },
    signIn: {
      type: UserTokenType,
      args: { input: { type: UserLoginInputType } },
      resolve: async (parent, { input: { login, password } }, { secret }) => {
        const user = await User.findByLogin(login);

        if (!user) {
          throw new UserInputError(
            'No user found with this login credentials.',
          );
        }

        const isValid = await user.validatePassword(password);

        if (!isValid) {
          throw new AuthenticationError('Invalid password.');
        }

        return { token: createToken(user, secret, '30m') };
      },
    },

    updateUser: {
      type: UserType,
      args: { username: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: combineResolvers(
        isAuthenticated,
        async (parent, { username }, { me }) => {
          const user = await User.findById(me.id);
          return user.update({ username });
        },
      ),
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: combineResolvers(isAdmin, async (parent, { id }) => {
        return User.destroy({
          where: { id },
        });
      }),
    },

    // User: {
    //   messages: async (user, args) => {
    //     return Message.findAll({
    //       where: {
    //         userId: user.id,
    //       },
    //     });
    //   },
    // },
  },
};
