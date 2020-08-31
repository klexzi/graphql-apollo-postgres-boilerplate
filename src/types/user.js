import {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';

export const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: { type: GraphQLInt },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
  }),
});

export const UserTokenType = new GraphQLObjectType({
  name: 'UserTokenType',
  fields: () => ({
    token: { type: GraphQLString },
  }),
});

export const UserSignupInputType = new GraphQLInputObjectType({
  name: 'UserSignupInput',
  fields: () => ({
    username: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const UserLoginInputType = new GraphQLInputObjectType({
  name: 'UserLoginInput',
  fields: () => ({
    login: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export default UserType;
