const passport = require('passport');
const { OAuth2Strategy: GoogleStrategy } = require('passport-google-oauth');
const axios = require('axios');
const boom = require('@hapi/boom');

const { config } = require('../../../config');

passport.use( new GoogleStrategy({
    clientID: config.googleClientId, //An id that google gives me for using his API
    clientSecret: config.googleClientSecret, //The secret that google gives me to send requests
    callbackURL: "/auth/google/callback",  //My srv's callback that google redirects to after all the proces
},
async (accessToken, refreshToken, { _json: profile }, done) => {
    try{
        const { data, status } = await axios({ //After google gives me the user's data i send the needed data
            url: `${config.apiUrl}/api/auth/sign-provider`,
            method: "post",
            data: {
                name: profile.name,
                email: profile.email,
                password: profile.sub,
                apiKeyToken: config.apiKeyToken
            }
        });
        //Then i receive the token and the user data back

        if(!data || status !== 200){
            done(boom.unauthorized(), false); //If data or status are not succesfull trigger unauthorized
        }

        done(null, data) //Executing callback with err null and passing the user
    }catch(err){
        done(err)
    }
}
) );