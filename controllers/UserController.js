class UserController{

    constructor(){
        this.setVariables();
        GulpApp.post('/register', this.register);
        GulpApp.post('/login', this.login);
        GulpApp.get('/logout', this.logout);
        GulpApp.post('/password', this.updatePassword);
        GulpApp.post('/account', this.updateAccount);
        GulpApp.get('/account', this.getAccount);
    }

    setVariables(){
        GulpApp.use(function(request, response, next) {
            if (request.session.token) {
                response.locals.loggedin = true;
            }
            if (request.session.user) {
                response.locals.user = request.session.user;
                response.locals.userEmail = request.session.userEmail;
                response.locals.userId = request.session.userId;
                response.locals.displayName = request.session.displayName;
            }
            if (request.session.userErrors) {
                response.locals.userErrors = request.session.userErrors;
            }
            request.session.userErrors = {};
            next();
        });
    }

    login = (request, response, next) => {

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
            GulpDatabase.firebase.auth()
                .signInWithEmailAndPassword(user.email, user.password)
                .then((data) => {
                    return data.user.getIdToken();
                })
                .then((token) => {
                    var user = GulpDatabase.firebase.auth().currentUser;
                    if (user != null) {
                        request.session.user = user;
                        request.session.userEmail = user.email;
                        request.session.userId = user.uid;
                        request.session.displayName = user.displayName;
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

    register = (request, response, next) => {
        
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
            GulpDatabase.firebase.auth()
                .createUserWithEmailAndPassword(user.email, user.password)
                .then((data) => {
                    return data.user.getIdToken();
                })
                .then((token) => {
                    var user = GulpDatabase.firebase.auth().currentUser;
                    if (user != null) {
                        request.session.userEmail = user.email;
                        request.session.userId = user.uid;
                        request.session.displayName = user.displayName;
                    }
                    request.session.token = token;
                    response.locals.loggedin = true;
                    response.redirect('/account');
                })
                .catch((error) => {
                    request.session.registerErrors = [error.message];
                    response.redirect('/');
                })
        }
    };
    

    updateAccount = (request, response, next) => {

        var currentUser = GulpDatabase.firebase.auth().currentUser;
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
                currentUser.updateProfile({
                    displayName: user.displayName,
                    email: user.email
                }).then(function() {
                    var currentUser = GulpDatabase.firebase.auth().currentUser;
                    if (currentUser != null) {
                        request.session.userEmail = user.email;
                        request.session.userId = user.uid;
                        request.session.displayName = user.displayName;
                    }
                    request.session.userErrors.profile = ['Your details have been updated.'];
                    response.redirect('/account');
                }).catch(function(error) {
                    request.session.userErrors.profile = [error.message];
                    response.redirect('/account');
                });
            }
        } else {
            request.session.genericErrors = ['You have been logged out due to inactivity'];
            this.logout(request, response, next);
        }

    };
    
    updatePassword = (request, response, next) => {

        var currentUser = GulpDatabase.firebase.auth().currentUser;
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
                currentUser.updatePassword(user.password).then(function() {
                    request.session.userErrors.password = ['Your password has been updated.'];
                    response.redirect('/account');
                }).catch(function(error) {
                    request.session.userErrors.password = [error.message];
                    response.redirect('/account');
                });
            }
        } else {
            request.session.genericErrors = ['You have been logged out due to inactivity'];
            this.logout(request, response, next);
        }

    };

    logout(request, response, next) {
        request.session.userName = false;
        request.session.userEmail = false;
        request.session.userAvatar = false;
        request.session.userId = false;
        request.session.token = false;
        response.locals.loggedin = false;
        response.redirect('/');
    }

    getAccount(request, response, next) {
        if (!request.session.token) {
            response.redirect('/');
        }
        response.render('account');
    }
    
    upload(file){
        var extensions = [".png", ".jpg", ".jpeg", ".gif"];
        if (this.allowed_file(file.filename, extensions)) {
            user = User();
            user_id_token = user.get_user_id_token();
            user_id = user.get_user_id();
            var tmp = require('tmp');
            var path = require('path');
            var ext = path.extname(file);
            var temp = tmp.fileSync({ mode: '0644', prefix: user_id, postfix: ext });
            storage = GulpDatabase.storage();
            result = storage.child(new_name).put(temp.name, user_id_token);
            console.log(result);
            return result;

        } else {
            console.log("Only allowed filetypes: ".join(extensions.join()));
        }
    }

    allowed_file(filename, extensions){
        return extensions.includes(filename.split('.').pop());
    }

}
module.exports = UserController;