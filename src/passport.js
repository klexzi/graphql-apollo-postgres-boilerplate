/* eslint-disable no-unused-vars */
import FacebookStrategy from 'passport-facebook';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { User } from './models';
import formDefaultPassword from './utils/formDefaultPassword';

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const handleSocialCallback = (err, user, res, next) => {
  if (err) {
    next(err);
  }
  if (!user) {
    return res.json({
      message: 'Access denied',
      success: false,
      token: null,
    });
  }
  return res.json({
    message: 'Successful',
    success: true,
    token: user.createToken(process.env.SECRET),
  });
};
/**
 *
 * @param {Passport} passport passport instance
 * @param {Express} app express app
 */
// eslint-disable-next-line no-unused-vars
export default function initPassport(passport, app) {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then((user) => {
        done(null, user);
      })
      .catch(done);
  });
  passport.use(
    new JwtStrategy(
      {
        secretOrKey: process.env.SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      // eslint-disable-next-line no-unused-vars
      async (payload, done) => {
        const user = await User.findByPk(payload.id);

        return done(null, user);
      },
    ),
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'email', 'first_name', 'last_name'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const [user] = await User.findOrCreate({
            where: { facebookID: profile.id },
            defaults: {
              username: `${profile.name.givenName} ${profile.name.familyName}`,
              email:
                profile.emails && profile.emails[0] && profile.emails[0].value,
              password: formDefaultPassword(profile.name.givenName),
            },
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      },
    ),
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const [user] = await User.findOrCreate({
            where: { googleID: profile.id },
            defaults: {
              username: `${profile.name.givenName} ${profile.name.familyName}`,
              email:
                profile.emails && profile.emails[0] && profile.emails[0].value,
              password: formDefaultPassword(profile.name.givenName),
            },
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      },
    ),
  );

  app.get(
    '/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] }),
  );

  app.get('/auth/facebook/callback', (req, res, next) => {
    passport.authenticate(
      'facebook',
      {
        session: false,
      },
      (err, user) => handleSocialCallback(err, user, res, next),
    )(req, res, next);
  });

  app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }),
  );

  app.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) =>
      handleSocialCallback(err, user, res, next),
    )(req, res, next);
  });

  app.use('/graphql', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (user) {
        req.user = user;
      }

      next();
    })(req, res, next);
  });
}
