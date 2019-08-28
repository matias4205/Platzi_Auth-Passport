const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const UserService = require('../../../services/users');

passport.use(new BasicStrategy( async (email, password, done) => {
    const userService = new UserService();

    try {
        const user = await userService.getUser({ email });

        if(!user){
            done(boom.unauthorized(), false);
        }

        if(!await bcrypt.compare(password, user.password)){
            done(boom.unauthorized(), false);
        }

        delete user.password;

        return done(null, user);
    } catch (err) {
        done(err, false)
    }
}))