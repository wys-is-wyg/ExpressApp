class UserModel{

    constructor(){
        
        if (typeof this.instance === 'object') {
            return this.instance;
        }

        this.id = false;
        this.currentUser = false;
        this.isLoggedIn = false;

        this.instance = this;
        return this;
    }

    setUser(currentUser){
        this.id = currentUser.uid;
        this.currentUser = currentUser;
        this.isLoggedIn = true;
    }

    getId() {
        return this.id;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    login = async (request, response) => {
        var user = {
            email: request.body.email,
            password: request.body.password
        }
        var { valid, errors } = AraDTValidator.loginValid(user);
    
        if (!valid) {
            throw new Error(errors);
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
                })
                .catch((error) => {
                    throw new Error(error);
                })
        }
    };

    register = async (request, response) => {
        
        var user = {
            email: request.body.email,
            password: request.body.password,
            passwordConfirm: request.body.passwordConfirm
        }
        var { valid, errors } = AraDTValidator.registerValid(user);

        if (!valid) {
            throw new Error(errors);
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
                })
                .catch((error) => {
                    throw new Error(error);
                });
        }
    };

    logout = async (request, response) => {
        request.session.errors.general = ['You have been logged out'];
        response.locals.loggedin = false;
        request.session.destroy();
        await AraDTDatabase.firebase.auth().signOut()
            .then(function() {
                response.redirect('/');
            })
            .catch(function(error) {
                response.redirect('/');
            });
    }

    getAccount(request, response){
        
        if (!request.session.token) {
            response.redirect('/');
        }
        response.render('account');
    }

    update =  async (request, response) => {
        var upDatedUser = {
            email: request.body.email,
            displayName: request.body.displayName
        }
        var { valid, errors } = AraDTValidator.updateUserValid(upDatedUser);

        if (!valid) {
            throw new Error(errors);
        } else {
            if (request.files) {
                upDatedUser.photoURL = this.updateAvatar(request, response);
            }
            await this.currentUser.updateProfile(upDatedUser)
            .then(function() {
                var currentUser = AraDTDatabase.firebase.auth().currentUser;
                if (currentUser != null) {
                    AraDTUserModel.setUser(currentUser);
                    request.session.user = currentUser;
                }
                response.locals.user = request.session.user;
                request.session.save();
            })
            .catch(function(error) {
                throw new Error(error);
            });
        }
    };
    
    updateAvatar = (request, response) => {
        
        var { result, validExtension } = AraDTImageUpload.uploadImage(request.files.avatar, AraDTUserModel.getId());
        if (validExtension) {
            return result;
        } else {
            response.locals.errors.avatar = [result];
            response.render('account');
        }

    };
    
    updatePassword = async (request, response) => {

        var user = {
            password: request.body.password,
            passwordConfirm: request.body.passwordConfirm
        }
        
        var { valid, errors } = AraDTValidator.updatePasswordValid(user);

        if (!valid) {
            throw new Error(errors);
        } else {
            await this.currentUser.updatePassword(user.password)
                .catch((error) => {
                    throw new Error(error);
                });
        }        

    };

}
module.exports = UserModel;