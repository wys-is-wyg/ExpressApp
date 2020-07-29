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
        AraDTApp.use(function(request, response, next) {
            if (request.session) {
                if (request.session.token) {
                    response.locals.loggedin = true;
                }
                if (request.session.user) {
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
        request.session.errors.general = ['You have been logged out due to inactivity'];
        response.locals.loggedin = false;
        request.session.destroy();
        await AraDTDatabase.firebase.auth().signOut().then(function() {
            response.redirect('/');
          }).catch(function(error) {
            response.redirect('/');
          });
    }

    getAccount(request, response, next) {
        
        if (!request.session.token) {
            response.redirect('/');
        }
        response.render('account');
    }

    updateAccount =  async (request, response, next) => {

        var currentUser = await AraDTDatabase.firebase.auth().currentUser;
        if (currentUser != null) {
            var upDatedUser = {
                email: request.body.email,
                displayName: request.body.displayName
            }
            var { valid, errors } = AraDTValidator.updateUserValid(upDatedUser);

            if (!valid) {
                response.locals.errors.profile = errors;
                response.render('account');
            } else {
                if (request.files) {
                    upDatedUser.photoURL = this.updateAvatar(request, response, currentUser);
                }
                await currentUser.updateProfile(upDatedUser)
                .then(function() {
                    var currentUser = AraDTDatabase.firebase.auth().currentUser;
                    if (currentUser != null) {
                        request.session.user = currentUser;
                    }
                    response.locals.user = request.session.user;
                    response.locals.errors.profile = ['Your details have been updated.'];
                    request.session.save();
                    response.render('account');
                })
                .catch(function(error) {
                    response.locals.errors.profile = [error.message];
                    response.render('account');
                });
            }
        } else {
            this.logout(request, response, next);
        }

    };
    
    updateAvatar = (request, response, currentUser) => {
        
        var { result, validExtension } = AraDTImageUpload.uploadImage(request.files.avatar, currentUser.uid);
        if (validExtension) {
            return result;
        } else {
            response.locals.errors.avatar = [result];
            response.render('account');
        }

    };
    
    updatePassword = async (request, response, next) => {


        var currentUser = await AraDTDatabase.firebase.auth().currentUser;
        if (currentUser != null) {
            var user = {
                password: request.body.password,
                passwordConfirm: request.body.passwordConfirm
            }
            
            var { valid, errors } = AraDTValidator.updatePasswordValid(user);

            if (!valid) {
                request.session.errors.password = errors;
                response.redirect('/account');
            } else {
                await currentUser.updatePassword(user.password).then(function() {
                    request.session.errors.password = ['Your password has been updated.'];
                    response.redirect('/account');
                }).catch(function(error) {
                    request.session.errors.password = [error.message];
                    response.redirect('/account');
                });
            }        
        } else {
            this.logout(request, response, next);
        }

    };

}
module.exports = UserController;