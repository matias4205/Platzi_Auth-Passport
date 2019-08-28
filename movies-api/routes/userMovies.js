const router = require('express').Router();

const validationHandler = require('../utils/middleware/validationHandler');
const { createUserMovieSchema, userMovieIdSchema } = require('../utils/schemas/userMovies');
const { userIdSchema } = require('../utils/schemas/users');
const UserMoviesService = require('../services/userMovies');
const userMoviesService = new UserMoviesService();

router.get('/', validationHandler({ userId: userIdSchema }, 'query'), (req, res, next) => {
    const { userId } = req.params;

    try {
        const userMovies = userMoviesService.getUserMovies({ userId })

        res.status(200).json({
            data: userMovies,
            message: "User movie data retrived succesfully"
        })
    } catch (err) {
        next(err);
    }
})

router.post('/', validationHandler({ userMovie: createUserMovieSchema }), (req, res, next) => {
    const { body: userMovie } = req;

    try {
        const createdUserMovieId = userMoviesService.createUserMovie({ userMovie })

        res.status(201).json({
            data: createdUserMovieId,
            message: "User movie created succesfully"
        })
    } catch (err) {
        next(err);
    }
})

router.delete('/:userMovieId', validationHandler({ userMovieId: userMovieIdSchema }, 'params'), (req, res, next) => {
    const { body: userMovieId } = req.params;

    try {
        const deletedUserMovieId = userMoviesService.deleteUserMovie({ userMovieId })

        res.status(200).json({
            data: deletedUserMovieId,
            message: "User movie deleted succesfully"
        })
    } catch (err) {
        next(err);
    }
})

module.exports = router;