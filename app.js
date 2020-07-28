var express = require('express');
var session = require('express-session');
var path = require('path');
var logger = require('morgan');
var fileUpload = require('express-fileupload');

AraDTApp = express();
AraDTApp.use(session({
    secret: 'hurrdurr',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// view engine setup
AraDTApp.set('views', path.join(__dirname, 'views'));
AraDTApp.set('view engine', 'ejs');

AraDTApp.use(fileUpload({createParentPath: true}));
AraDTApp.use(logger('dev'));
AraDTApp.use(express.json());
AraDTApp.use(express.urlencoded({ extended: false }));
AraDTApp.use(express.static(path.join(__dirname, 'public')));

var Database = require('./classes/Database'); 
AraDTDatabase = new Database(); 
var ImageUpload = require('./classes/ImageUpload');
AraDTImageUpload = new ImageUpload();
var Validator = require('./classes/Validator');
AraDTValidator = new Validator();
var Router = require('./classes/Router');
AraDTRouter = new Router();

module.exports = AraDTApp;