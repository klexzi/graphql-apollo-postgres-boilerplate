import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { UserResolvers } from './resolvers';

// NOTE: If you get circular dependency issues with a new set of fields
// simpy make it a function that returns the field object and add it the
// same way here. The function will get executed later once all dependencies
// have loaded

const executeThunk = (thunk) => (typeof thunk === 'function' ? thunk() : thunk);

const rootQueries = [UserResolvers.Query];

const rootMutations = [UserResolvers.Mutation];

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: () => Object.assign({}, ...rootQueries.map(executeThunk)),
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => Object.assign({}, ...rootMutations.map(executeThunk)),
});

const schema = new GraphQLSchema({ query: Query, mutation: Mutation });

export default schema;
