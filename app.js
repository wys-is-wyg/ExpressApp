// Add all required modules
var http = require('http');
var express = require('express');
var session = require('express-session');
var path = require('path');
var logger = require('morgan');
var fileUpload = require('express-fileupload');

/** 
 * Instantiate the Express app and 
 * assign it to a global variable
 * psuedo namespaced under AraDT
 */
AraDTApp = express();
AraDTApp.use(session({
    secret: 'hodor',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

AraDTApp.use('/socket', express.static('./node_modules/socket.io-client/dist'));

AraDTServer = http.createServer(AraDTApp);
AraDTIO = require('socket.io').listen(AraDTServer);
AraDTServer.listen(80);

AraDTIO.on('connection', function (socket) {
    console.log("Connected succesfully to the socket ...");

    var news = [
        { title: 'The cure of the Sadness is to play Videogames',date:'04.10.2016'},
        { title: 'Batman saves Racoon City, the Joker is infected once again',date:'05.10.2016'},
        { title: "Deadpool doesn't want to do a third part of the franchise",date:'05.10.2016'},
        { title: 'Quicksilver demand Warner Bros. due to plagiarism with Speedy Gonzales',date:'04.10.2016'},
    ];

    // Send news on the socket
    socket.emit('news', news);
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

// Assign view directory and EJS template language
AraDTApp.set('views', path.join(__dirname, 'views'));
AraDTApp.set('view engine', 'ejs');

/** 
 * Add key middleware for:
 *      File uploads
 *      Console logging requests
 *      JSON parsing
 *      Request string parsing
 */ 
AraDTApp.use(fileUpload({createParentPath: true}));
AraDTApp.use(logger('dev'));
AraDTApp.use(express.json());
AraDTApp.use(express.urlencoded({ extended: false }));

// Assign static files directory
AraDTApp.use(express.static(path.join(__dirname, 'public')));


/**
 * Add simple MVC framework including:
 *      Firebase database class
 *      Image uploader
 *      Data validator
 *      Key models
 *      A router
 * All are psuedo namespaced under AraDT
 */
var Database = require('./classes/Database'); 
AraDTDatabase = new Database(); 
var ImageUpload = require('./classes/ImageUpload');
AraDTImageUpload = new ImageUpload();
var Validator = require('./classes/Validator');
AraDTValidator = new Validator();
var ChannelModel = require('./models/ChannelModel');
AraDTChannelModel = new ChannelModel();
var UserModel = require('./models/UserModel');
AraDTUserModel = new UserModel();
var Router = require('./classes/Router');
AraDTRouter = new Router();

module.exports = AraDTApp;