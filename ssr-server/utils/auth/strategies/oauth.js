const passport = require('passport');
const axios = require('axios');
const boom = require('@hapi/boom');
const { OAuth2Strategy } = require('passport-oauth');

const { config } = require('../../../config/index');

const GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://www.googleapis.com/oauth2/v4/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const oAuth2Strategy = new OAuth2Strategy({
    authorizationURL: GOOGLE_AUTHORIZATION_URL, //This is the url to ask the user for concent
    tokenURL: GOOGLE_TOKEN_URL, // This is the url to get the accessToken giving the authorizationToken from the last url
    clientID: config.googleClientId, // This is the way google identify my app
    clientSecret: config.googleClientSecret, // This is the secret for my app
    callbackURL: '/auth/google-oauth/callback', // This is the url that google redirects with all the info after all the process
},
async (accessToken, refreshTOken, profile, done) => { //At this point google has identified me and user, "profile" has the user info...
    const { data, status } = await axios({
        url: `${config.apiUrl}/api/auth/sign-provider`,
        method: 'post',
        data: {
            name: profile.name,
            email: profile.email,
            password: profile.id,
            apiKeyToken: config.apiKeyToken
        }
    });

    if(!data || status !== 200){
        return done(boom.unauthorized(), false);
    }

    return done(null, data);
});

oAuth2Strategy.userProfile = function (accessToken, done){ //THIS RUNS BEFORE THE PREVIOUS CALLBACK, this function gets the user profile data and gives it to the previous callback
    this._oauth2.get(GOOGLE_USERINFO_URL, accessToken, (err, body) => { //First argument is the providerUserInfoUrl and the second the accessToken
        if(err){
            return done(err)
        }
        
        try {
            const { sub, name, email } = JSON.parse(body);

            const profile = {
                id: sub,
                name,
                email
            }

            done(null, profile);
        } catch (parseError) {
            done(parseError, false)
        }
    });
}

passport.use('google-oauth', oAuth2Strategy);