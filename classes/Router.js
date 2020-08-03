var UserController = require('../controllers/UserController');
var ChannelController = require('../controllers/ChannelController');
var createError = require('http-errors');

class Router{

    constructor(){
        this.setVariables();
        this.addBaseRoutes();
        this.addControllers();
        this.handle404s();
        this.handleErrors();
    }

    setVariables(){
        AraDTApp.use(function(request, response, next) {
            if (request.session.errors) {
                response.locals.errors = request.session.errors;
            }
            request.session.errors = {};
            request.session.errors.general = [];
            next();
        });
    }

    addControllers() {
        var userController = new UserController();
        var channelController = new ChannelController();
    }

    addBaseRoutes() {
        AraDTApp.get('/', this.index);
    }

    index(request, response, next) {
        response.render('index');
    }

    handle404s() {
        AraDTApp.use(function(req, res, next) {
            next(createError(404));
        });
    }

    handleErrors() {
        
        // error handler
        AraDTApp.use(function(error, request, response, next) {
            if (error) {
                console.log('Error', error);
            }
            // set locals, only providing error in development
            response.locals.message = error.message;
            response.locals.error = error;
            
            // render the error page
            response.status(error.status || 500);
            response.render('error');
        });
    }

}
module.exports = Router;