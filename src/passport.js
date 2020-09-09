/* eslint-disable no-unused-vars */
import models from './models';

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
/**
 *
 * @param {Passport} passport passport instance
 * @param {Express} app express app
 */
// eslint-disable-next-line no-unused-vars
export default function initPassport(passport, app) {
  passport.use(
    new JwtStrategy(
      {
        secretOrKey: process.env.SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      // eslint-disable-next-line no-unused-vars
      (payload, done) => {},
    ),
  );
}
