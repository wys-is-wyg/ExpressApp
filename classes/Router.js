var createError = require('http-errors');

class Router{

    constructor(app){
        
        app.use(function(request, response, next) {
            if (request.session.token) {
                response.locals.loggedin = true;
            }
            next();
        });

        app.get('/', this.index);
        app.post('/register', this.register);
        app.post('/login', this.login);
        app.get('/account', this.isAuthorized, this.getAccount);
        app.post('/account', this.isAuthorized, this.updateAccount);


        // catch 404 and forward to error handler
        app.use(function(request, response, next) {
            next(createError(404));
        });
        
        // error handler
        app.use(function(err, request, response, next) {
            // set locals, only providing error in development
            response.locals.message = err.message;
            response.locals.error = request.app.get('env') === 'development' ? err : {};
            
            // render the error page
            response.status(err.status || 500);
            response.render('error');
        });
    }

    isAuthorized(request, response, next) {
        if (!request.session.token) {
            next(createError(403, 'You are unable to access this without logging in or registering'));
        } else {
            next();
        }
    }

    index(request, response, next) {
        response.render('index', { title: 'Home' });
    }

    register = (request, response, next) => {
        const user = {
            email: request.body.email,
            password: request.body.password
        }
    
        //const { valid, errors } = validateLoginData(user);
        //if (!valid) return response.status(400).json(errors);
    
        database.firebase.auth()
            .signInWithEmailAndPassword(user.email, user.password)
            .then((data) => {
                return data.user.getIdToken();
            })
            .then((token) => {
                request.session.token = token;
                response.locals.loggedin = true;
                response.redirect('/account');
            })
            .catch((error) => {
                next(createError(403, error.message));
            })
    };

    login = (request, response, next) => {
        const user = {
            email: request.body.email,
            password: request.body.password
        }
    
        //const { valid, errors } = validateLoginData(user);
        //if (!valid) return response.status(400).json(errors);
    
        database.firebase.auth()
            .signInWithEmailAndPassword(user.email, user.password)
            .then((data) => {
                return data.user.getIdToken();
            })
            .then((token) => {
                request.session.token = token;
                response.locals.loggedin = true;
                response.redirect('/account');
            })
            .catch((error) => {
                next(createError(403, error.message));
            })
    };

    getAccount(request, response, next) {
        response.render('account');
    }

    updateAccount(request, response, next) {
        response.render('account');
    }

}
module.exports = Router;