class UserController{

    constructor(){
        this.setVariables();
        AraDTApp.post('/register', this.register);
        AraDTApp.post('/login', this.login);
        AraDTApp.get('/logout', this.logout);
        AraDTApp.get('/account', this.getAccount);
        AraDTApp.post('/account', this.updateAccount);
        AraDTApp.post('/password', this.updatePassword);
    }

    setVariables(){
        AraDTApp.use(async function(request, response, next) {
            if (request.session) {
                if (request.session.token) {
                    var currentUser = await AraDTDatabase.firebase.auth().currentUser;
                    if (currentUser != null) {
                        AraDTUserModel.setUser(currentUser);
                    }
                    response.locals.loggedin = true;
                }
                if (request.session.user) {
                    response.locals.user = request.session.user;
                }
            }
            next();
        });
    }

    login = async (request, response) => {
        try{
            await AraDTUserModel.login(request, response)
                .then(() => {
                    response.redirect('/account');
                }).catch((error) => {
                    request.session.errors.login = [error.message];
                    response.redirect('/');
                });

        } catch(errors) {
            request.session.errors.login = errors;
            response.redirect('/');
        }
    };

    register = async (request, response) => {
        try{
            await AraDTUserModel.register(request, response)
                .then(() => {
                    response.redirect('/account');
                }).catch((error) => {
                    request.session.errors.register = [error.message];
                    response.redirect('/');
                });

        } catch(errors) {
            request.session.errors.register = errors;
            response.redirect('/');
        }
    };

    logout = async (request, response) => {
        request.session.errors.general = ['You have been logged out'];
        response.locals.loggedin = false;
        request.session.destroy();
        await AraDTDatabase.firebase.auth().signOut().then(function() {
                response.redirect('/');
            }).catch(function(error) {
                response.redirect('/');
            });
    }

    updateAccount =  async (request, response) => {

        var currentUser = AraDTUserModel.getCurrentUser();
        if (currentUser) {
            try{
                await AraDTUserModel.update(request, response)
                    .then(() => {
                        response.locals.errors.profile = ['Your details have been updated'];
                        response.render('account');
                    }).catch((error) => {
                        response.locals.errors.profile = [error.message];
                        response.render('account');
                    });
            } catch(errors) {
                response.locals.errors.profile = errors;
                response.render('account');
            }
        } else {
            this.logout(request, response);
        }

    };
    
    updatePassword = async (request, response) => {

        var currentUser = AraDTUserModel.getCurrentUser();
        if (currentUser) {
            try{
                await AraDTUserModel.updatePassword(request, response)
                    .then(() => {
                        response.locals.errors.password = ['Your password has been updated'];
                        response.render('account');
                    }).catch((error) => {
                        response.locals.errors.password = [error.message];
                        response.render('account');
                    });
            } catch(errors) {
                response.locals.errors.password = errors;
                response.render('account');
            }
        } else {
            this.logout(request, response);
        }

    };

    getAccount(request, response){
        
        if (!request.session.token) {
            response.redirect('/');
        }
        response.render('account');
    }

}
module.exports = UserController;