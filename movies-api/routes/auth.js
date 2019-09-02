const router = require('express').Router();
const passport = require('passport');
const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');

const ApiKeysService = require('../services/apiKeys');
const UsersService = require('../services/users');
const validationHandler = require('../utils/middleware/validationHandler');
const { createUserSchema, createProviderUserSchema } = require('../utils/schemas/users');

const { config } = require('../config');

const apiKeyService = new ApiKeysService();
const usersService = new UsersService(); 

//Basic strategy
require('../utils/auth/strategies/basic');

router.post('/sign-in', async (req, res, next) => {
    const { apiKeyToken } = req.body;

    if(!apiKeyToken){
        next(boom.unauthorized('apiKeyToken is required'));
    }

    passport.authenticate('basic', (error, user) => {
        try {
            if(error || !user){
                next(boom.unauthorized());
            }

            req.login(user, { session: false }, async (err) => {
                if(err){
                    next(err);
                }

                const apiKey = await apiKeyService.getApiKey({ token: apiKeyToken });

                if(!apiKey) {
                    next(boom.unauthorized());
                }

                const { _id: id, name, email } = user;
                const payload = {
                    sub: id,
                    name,
                    email,
                    scopes: apiKey.scopes
                }

                const token = jwt.sign(payload, config.authJwtSecret, {
                    expiresIn: '15m'
                });

                return res.status(200).json({
                    token,
                    user: {
                        id,
                        name,
                        email
                    }
                });
            });
        } catch (err) {
            next(err)
        }
    })(req, res, next);
});

router.post('/sign-up', validationHandler(createUserSchema), async (req, res, next) => {
    const { body: user } = req;

    try {
        const createdUserId = await usersService.createUser({ user });

        res.status(201).json({
            data: createdUserId,
            message: "User created succesfully"
        });
    } catch (err) {
        next(err)
    }
});

router.post('/sign-provider', validationHandler(createProviderUserSchema), async (req, res, next) => {
    const { body } = req; //Extractig body request data
    const { apiKeyToken, ...user } = body; //I receive the apiToken and the user data

    if(!apiKeyToken){ //If i dont get an apiKey trigger an error
        next(boom.unauthorized('apiKeyToken is required'));
    }

    try {
        //I search in my db for the given user, if i found him i get his data, and if i dont, i create it and then get his data
        const queriedUser = await usersService.getOrCreateUser({ user }); 
        //I look for the received apiKey token looking for the corresponding scopes
        const apiKey = await apiKeyService.getApiKey({ token: apiKeyToken });

        if(!apiKey){ //If there is not an API key retrived from the db triggers an error
            next(boom.unauthorized());
        }

        const { _id: id, name, email } = queriedUser; //Now extrats the data retrived from the user's database data

        const payload = { //Builds the payload including user's info and the scopes
            sub: id,
            name,
            email,
            scopes: apiKey.scopes
        }

        const token = jwt.sign(payload, config.authJwtSecret, { //Signing the token
            expiresIn: '15m'
        })

        res.status(200).json({ token, user: { id, name, email } }); //Answering with succesfull, token and user's data
    } catch (err) {
        next(err)
    }
});

module.exports = router;