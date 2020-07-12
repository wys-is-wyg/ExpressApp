var express = require('express');
var session = require('express-session');
var path = require('path');

var app = express();
app.use(session({
  secret: 'ashubbery',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var Database = require('./classes/Database'); 
database = new Database(); 
var Router = require('./classes/Router');
var router = new Router(app);
/*
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Socket = require('./classes/Socket');
var socket = new Socket(io);
*/
module.exports = app;
