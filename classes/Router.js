var UserController = require('../controllers/UserController');

class Router{

    constructor(){
        this.addControllers();
        this.addBaseRoutes();
        this.handleErrors();
    }

    addControllers() {
        var userController = new UserController();
    }

    addBaseRoutes() {
        GulpApp.get('/', this.index);
    }

    index(request, response, next) {
        response.render('index');
    }

    handleErrors() {
        var createError = require('http-errors');

        // catch 404 and forward to error handler
        GulpApp.use(function(request, response, next) {
            next(createError(404));
        });
        
        // error handler
        GulpApp.use(function(error, request, response, next) {
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