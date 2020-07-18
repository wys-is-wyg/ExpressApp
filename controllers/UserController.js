var User = require('../models/UserModel');

class UserController{

    constructor(){
        this.setVariables();
        GulpApp.post('/register', this.register);
        GulpApp.post('/login', this.login);
        GulpApp.get('/logout', this.logout);
        GulpApp.post('/password', this.updatePassword);
        GulpApp.post('/account', this.updateAccount);
        GulpApp.get('/account', this.getAccount);
        GulpApp.post('/avatar', this.updateAvatar);
    }

    setVariables(){
        GulpApp.use(function(request, response, next) {
            if (request.session) {
                if (request.session.token) {
                    response.locals.loggedin = true;
                }
                if (request.session.user) {
                    response.locals.user = request.session.user;
                }
                if (request.session.userErrors) {
                    response.locals.userErrors = request.session.userErrors;
                } else {
                    response.locals.userErrors = {};
                }
                request.session.userErrors = {};

            }
            next();
        });
    }

    login = async (request, response, next) => {
        var user = {
            email: request.body.email,
            password: request.body.password
        }
        var { valid, errors } = GulpValidator.loginValid(user);
    
        if (!valid) {
            request.session.loginErrors = errors;
            request.session.userErrors.login = errors;
            response.redirect('/');
        } else {
            await GulpDatabase.firebase.auth()
                .signInWithEmailAndPassword(user.email, user.password)
                .then((data) => {
                    return data.user.getIdToken();
                })
                .then((token) => {
                    var user = GulpDatabase.firebase.auth().currentUser;
                    if (user != null) {
                        request.session.user = user;
                    }
                    request.session.token = token;
                    response.locals.loggedin = true;
                    response.redirect('/account');
                })
                .catch((error) => {
                    request.session.loginErrors = [error.message];
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
        var { valid, errors } = GulpValidator.registerValid(user);

        if (!valid) {
            request.session.registerErrors = errors;
            response.redirect('/');
        } else {
            await GulpDatabase.firebase.auth()
                .createUserWithEmailAndPassword(user.email, user.password)
                .then((data) => {
                    return data.user.getIdToken();
                })
                .then((token) => {
                    var user = GulpDatabase.firebase.auth().currentUser;
                    if (user != null) {
                        request.session.user = user;
                    }
                    request.session.token = token;
                    response.locals.loggedin = true;
                    response.redirect('/account');
                })
                .catch((error) => {
                    request.session.registerErrors = [error.message];
                    response.redirect('/');
                });
        }
    };
    

    updateAccount =  async (request, response, next) => {

        var currentUser = await GulpDatabase.firebase.auth().currentUser;
        if (currentUser != null) {
            var user = {
                email: request.body.email,
                displayName: request.body.displayName
            }
            
            var { valid, errors } = GulpValidator.updateUserValid(user);

            if (!valid) {
                request.session.userErrors.profile = errors;
                response.redirect('/account');
            } else {
                await currentUser.updateProfile({
                    displayName: user.displayName,
                    email: user.email
                })
                .then(function() {
                    var currentUser = GulpDatabase.firebase.auth().currentUser;
                    if (currentUser != null) {
                        request.session.user = currentUser;
                    }
                    request.session.userErrors.profile = ['Your details have been updated.'];
                    response.redirect('/account');
                })
                .catch(function(error) {
                    request.session.userErrors.profile = [error.message];
                    request.session.save();
                    response.redirect('/account');
                });
            }
        } else {
            request.session.genericErrors = ['You have been logged out due to inactivity'];
            this.logout(request, response, next);
        }

    };
    
    updatePassword = async (request, response, next) => {

        var currentUser = await GulpDatabase.firebase.auth().currentUser;
        if (currentUser != null) {
            var user = {
                password: request.body.password,
                passwordConfirm: request.body.passwordConfirm
            }
            
            var { valid, errors } = GulpValidator.updatePasswordValid(user);

            if (!valid) {
                request.session.userErrors.password = errors;
                response.redirect('/account');
            } else {
                await currentUser.updatePassword(user.password).then(function() {
                    request.session.userErrors.password = ['Your password has been updated.'];
                    response.redirect('/account');
                }).catch(function(error) {
                    request.session.userErrors.password = [error.message];
                    request.session.save();
                    response.redirect('/account');
                });
            }
        } else {
            request.session.genericErrors = ['You have been logged out due to inactivity'];
            this.logout(request, response, next);
        }

    };

    logout = async (request, response, next) => {
        await GulpDatabase.firebase.auth().signOut().then(function() {
            request.session.genericErrors = ['You have been logged out due to inactivity'];
            response.locals.loggedin = false;
            request.session.destroy();
            response.redirect('/');
          }).catch(function(error) {
            request.session.genericErrors = ['There was a problem logging you out.'];
            response.redirect('/');
          });
    }

    getAccount(request, response, next) {
        
        if (!request.session.token) {
            response.redirect('/');
        }
        response.render('account');
    }
    
    updateAvatar = async (request, response, next) => {
        
        var currentUser = await GulpDatabase.firebase.auth().currentUser;
        if (currentUser != null) {
            if(!request.files) {
                request.session.userErrors.avatar = ['You need to select a suitable file'];
                response.redirect('/account');
            } 
            var { result, validExtension } = GulpImageUpload.uploadImage(request.files.avatar, currentUser.uid);
            if (validExtension) {
                await currentUser.updateProfile({photoURL: result})
                .then(function() {
                    var currentUser = GulpDatabase.firebase.auth().currentUser;
                    if (currentUser != null) {
                        request.session.user = currentUser;
                    }
                    request.session.userErrors.avatar = ['Your image has been updated.'];
                    response.redirect('/account');
                })
                .catch((error) => {
                    request.session.userErrors.avatar = [error.message];
                    response.redirect('/account');
                });
            } else {
                request.session.userErrors.avatar = [result];
                response.redirect('/account');
            }
        } else {
            request.session.genericErrors = ['You have been logged out due to inactivity'];
            this.logout(request, response, next);
        }

    };

}
module.exports = UserController;