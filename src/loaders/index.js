import DataLoader from 'dataloader';
import * as userLoader from './user';

const setupLoaders = () => ({
  user: new DataLoader((keys) => userLoader.batchUsers(keys)),
});

export default setupLoaders;
