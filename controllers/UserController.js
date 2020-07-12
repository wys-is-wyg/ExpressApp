class UserController{

    constructor(){
        GulpApp.use(function(request, response, next) {
            if (request.session.token) {
                response.locals.loggedin = true;
            }
            next();
        });
        GulpApp.post('/register', this.register);
        GulpApp.post('/login', this.login);
        GulpApp.get('/logout', this.logout);
        GulpApp.get('/account', this.getAccount);
        GulpApp.post('/account', this.updateAccount);
    }

    register = (request, response, next) => {

        var user = {
            email: request.body.email,
            password: request.body.password,
            passwordConfirm: request.body.passwordConfirm
        }
        var { valid, errors } = GulpValidator.registerValid(user);

        if (!valid) {
            response.locals.errors = errors[0];
            response.render('index');
        }
        GulpDatabase.firebase.auth()
            .createUserWithEmailAndPassword(user.email, user.password)
            .then((data) => {
                return data.user.getIdToken();
            })
            .then((token) => {
                request.session.token = token;
                response.locals.loggedin = true;
                response.redirect('/account');
            })
            .catch((error) => {
                response.locals.errors = error.message;
                response.render('index');
            })
    };

    login = (request, response, next) => {

        var user = {
            email: request.body.email,
            password: request.body.password
        }
        var { valid, errors } = GulpValidator.loginValid(user);
    
        if (!valid) {
            response.locals.errors = errors[0];
            response.render('index');
        }

        GulpDatabase.firebase.auth()
            .signInWithEmailAndPassword(user.email, user.password)
            .then((data) => {
                return data.user.getIdToken();
            })
            .then((token) => {
                request.session.token = token;
                response.locals.loggedin = true;
                return response.redirect('/account');
            })
            .catch((error) => {
                response.locals.errors = error.message;
                response.render('index');
            })
    };

    logout(request, response, next) {
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

    updateAccount(request, response, next) {
        
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