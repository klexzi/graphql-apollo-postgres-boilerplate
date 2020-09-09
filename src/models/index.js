/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import Sequelize from 'sequelize';
import UserModel from './user';

// eslint-disable-next-line import/no-mutable-exports
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
  });
} else {
  sequelize = new Sequelize(
    process.env.TEST_DATABASE || process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      dialect: 'postgres',
    },
  );
}
// add each model here
const User = UserModel(sequelize, Sequelize);

export { sequelize, User };
