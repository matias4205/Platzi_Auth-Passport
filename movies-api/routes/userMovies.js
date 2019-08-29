const router = require('express').Router();
const passport = require('passport');

const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidationHandler = require('../utils/middleware/scopesValidationHandler');

const { createUserMovieSchema, userMovieIdSchema } = require('../utils/schemas/userMovies');
const { userIdSchema } = require('../utils/schemas/users');
const UserMoviesService = require('../services/userMovies');
const userMoviesService = new UserMoviesService();

//JWT strategy
require('../utils/auth/strategies/jwt');

router.get('/', 
    passport.authenticate('jwt', { session: false }), 
    scopesValidationHandler(['read:user-movies']),
    validationHandler({ userId: userIdSchema }, 'query'),
    async (req, res, next) => {
        const { userId } = req.params;

        try {
            const userMovies = await userMoviesService.getUserMovies({ userId })

            res.status(200).json({
                data: userMovies,
                message: "User movie data retrived succesfully"
            })
        } catch (err) {
            next(err);
        }
})

router.post('/', 
    passport.authenticate('jwt', { session: false }), 
    scopesValidationHandler(['create:user-movies']),
    validationHandler(createUserMovieSchema), 
    async (req, res, next) => {
        const { body: userMovie } = req;

        try {
            const createdUserMovieId = await userMoviesService.createUserMovie({ userMovie })

            res.status(201).json({
                data: createdUserMovieId,
                message: "User movie created succesfully"
            })
        } catch (err) {
            next(err);
        }
})

router.delete('/:userMovieId', 
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['delete:user-movies']),
    validationHandler({ userMovieId: userMovieIdSchema }, 'params'), 
    async (req, res, next) => {
        const { userMovieId } = req.params;

        try {
            const deletedUserMovieId = await userMoviesService.deleteUserMovie({ userMovieId })

            res.status(200).json({
                data: deletedUserMovieId,
                message: "User movie deleted succesfully"
            })
        } catch (err) {
            next(err);
        }
})

module.exports = router;