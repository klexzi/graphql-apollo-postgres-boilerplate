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
      resolve: async (parent, args, { models }) => {
        return models.user.findAll();
      },
    },
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: async (parent, { id }, { models }) => {
        return models.user.findById(id);
      },
    },
    me: {
      type: UserType,
      resolve: async (parent, args, { models, me }) => {
        if (!me) {
          return null;
        }
        return models.user.findById(me.id);
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
        { models, secret },
      ) => {
        const user = await models.user.create({
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
      resolve: async (
        parent,
        { input: { login, password } },
        { models, secret },
      ) => {
        const user = await models.user.findByLogin(login);

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
        async (parent, { username }, { models, me }) => {
          const user = await models.user.findById(me.id);
          return user.update({ username });
        },
      ),
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: combineResolvers(isAdmin, async (parent, { id }, { models }) => {
        return models.user.destroy({
          where: { id },
        });
      }),
    },

    // User: {
    //   messages: async (user, args, { models }) => {
    //     return models.Message.findAll({
    //       where: {
    //         userId: user.id,
    //       },
    //     });
    //   },
    // },
  },
};
