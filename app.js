var express = require('express');
var session = require('express-session');
var path = require('path');
var logger = require('morgan');
var fileUpload = require('express-fileupload');

GulpApp = express();
GulpApp.use(session({
    secret: 'hurrdurr',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// view engine setup
GulpApp.set('views', path.join(__dirname, 'views'));
GulpApp.set('view engine', 'ejs');

GulpApp.use(fileUpload({createParentPath: true}));
GulpApp.use(logger('dev'));
GulpApp.use(express.json());
GulpApp.use(express.urlencoded({ extended: false }));
GulpApp.use(express.static(path.join(__dirname, 'public')));

var Database = require('./classes/Database'); 
GulpDatabase = new Database(); 
var ImageUpload = require('./classes/ImageUpload');
GulpImageUpload = new ImageUpload();
var Validator = require('./classes/Validator');
GulpValidator = new Validator();
var Router = require('./classes/Router');
GulpRouter = new Router();

/*
var http = require('http').Server(GulpApp);
var io = require('socket.io')(http);
var Socket = require('./classes/Socket');
GulpSocket = new Socket(io);
*/
module.exports = GulpApp;
