import { combineResolvers } from 'graphql-resolvers';
import { AuthenticationError } from 'apollo-server';

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
          hasPassword: true,
        });

        return { token: user.createToken(secret, '30m') };
      },
    },
    signIn: {
      type: UserTokenType,
      args: { input: { type: UserLoginInputType } },
      resolve: async (parent, { input: { login, password } }, { secret }) => {
        const user = await User.findByLogin(login);

        if (!user) {
          throw new AuthenticationError('Invalid email or password.');
        }

        const isValid = await user.validatePassword(password);

        if (!isValid || !user.hasPassword) {
          throw new AuthenticationError('Invalid email or password.');
        }

        return { token: user.createToken(secret) };
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
    //   videos: async (user, args) => {
    //     return Video.findAll({
    //       where: {
    //         userId: user.id,
    //       },
    //     });
    //   },
    // },
  },
};
