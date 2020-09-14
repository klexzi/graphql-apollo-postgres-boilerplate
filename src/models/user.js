import { Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }

    static async findByLogin(login) {
      let foundUser = await User.findOne({
        where: { username: login },
      });

      if (!foundUser) {
        foundUser = await User.findOne({
          where: { email: login },
        });
      }

      return foundUser;
    }

    generatePasswordHash = async () => {
      const saltRounds = 10;
      return bcrypt.hash(this.password, saltRounds);
    };

    validatePassword = async (password) => {
      return bcrypt.compare(password, this.password);
    };

    createToken = (secret, expiresIn = '30m') => {
      const { id, email, username, role } = this;
      return jwt.sign({ id, email, username, role }, secret, {
        expiresIn,
      });
    };
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: [7, 42],
        },
      },
      hasPassword: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      role: {
        type: DataTypes.STRING,
      },
      facebookID: {
        type: DataTypes.STRING,
        unique: true,
      },
      googleID: {
        type: DataTypes.STRING,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
    },
  );

  User.beforeCreate(async (currUser) => {
    if (currUser.password) {
      // eslint-disable-next-line no-param-reassign
      currUser.password = await currUser.generatePasswordHash();
    }
  });
  return User;
};
