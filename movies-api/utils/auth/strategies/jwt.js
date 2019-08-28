const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const boom = require('@hapi/boom');

const UsersService = require('../../../services/users');
const { config } = require('../../../config');

passport.use(new Strategy( {
    secretOrKey: config.authJwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}, async(tokenPayload, done) => {
    const usersService = new UsersService();
    
    try {
        const user = usersService.getUser({ email: tokenPayload.email });

        if(!user){
            done(boom.unauthorized(), false);
        }

        delete user.password;

        return done(null, { ...user, scopes: tokenPayload.scopes });
    } catch (err) {
        done(err, false);
    }
})

);
