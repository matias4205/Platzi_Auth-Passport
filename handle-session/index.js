const express = require('express');
const session = require('express-session');

const app = express();

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "xmmatxm"
}));

app.get('/', (req, res) => {
    req.session.count = req.session.count ? req.session.count + 1 : req.session.count = 1;
    res.status(200).json({
        message: 'Hello world',
        counter: req.session.count
    });
});

const server = app.listen(3000, (error) => {
    if(error){
        throw error;
    }

    console.log("Listening at http://localhost:" + server.address().port);
})