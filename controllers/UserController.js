class UserController{

    constructor(){
        this.setVariables();
        AraDTApp.post('/register', this.register);
        AraDTApp.post('/login', this.login);
        AraDTApp.get('/logout', this.logout);
        AraDTApp.get('/account', this.getAccount);
    }

    setVariables(){
        AraDTApp.use(function(request, response, next) {
            if (request.session) {
                if (request.session.token) {
                    response.locals.loggedin = true;
                }
                if (request.session.user) {
                    console.log(request.session.user);
                    response.locals.user = request.session.user;
                }
            }
            next();
        });
    }

    login = async (request, response, next) => {
        var user = {
            email: request.body.email,
            password: request.body.password
        }
        var { valid, errors } = AraDTValidator.loginValid(user);
    
        if (!valid) {
            request.session.errors.login = errors;
            response.redirect('/');
        } else {
            await AraDTDatabase.firebase.auth()
                .signInWithEmailAndPassword(user.email, user.password)
                .then((data) => {
                    return data.user.getIdToken();
                })
                .then((token) => {
                    var user = AraDTDatabase.firebase.auth().currentUser;
                    if (user != null) {
                        request.session.user = user;
                        console.log(request.session.user);
                    }
                    request.session.token = token;
                    response.locals.loggedin = true;
                    response.redirect('/account');
                })
                .catch((error) => {
                    request.session.errors.login = [error.message];
                    response.redirect('/');
                })
        }
    };

    register = async (request, response, next) => {
        
        var user = {
            email: request.body.email,
            password: request.body.password,
            passwordConfirm: request.body.passwordConfirm
        }
        var { valid, errors } = AraDTValidator.registerValid(user);

        if (!valid) {
            request.session.errors.register = errors;
            response.redirect('/');
        } else {
            await AraDTDatabase.firebase.auth()
                .createUserWithEmailAndPassword(user.email, user.password)
                .then((data) => {
                    return data.user.getIdToken();
                })
                .then((token) => {
                    var user = AraDTDatabase.firebase.auth().currentUser;
                    if (user != null) {
                        request.session.user = user;
                    }
                    request.session.token = token;
                    response.locals.loggedin = true;
                    response.redirect('/account');
                })
                .catch((error) => {
                    request.session.errors.register = [error.message];
                    response.redirect('/');
                });
        }
    };

    logout = async (request, response, next) => {
        await AraDTDatabase.firebase.auth().signOut().then(function() {
            request.session.errors.general = ['You have been logged out due to inactivity'];
            response.locals.loggedin = false;
            request.session.destroy();
            response.redirect('/');
          }).catch(function(error) {
            request.session.errors.general = ['There was a problem logging you out.'];
            response.redirect('/');
          });
    }

    getAccount(request, response, next) {
        
        if (!request.session.token) {
            response.redirect('/');
        }
        response.render('account');
    }

}
module.exports = UserController;