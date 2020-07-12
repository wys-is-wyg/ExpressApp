class Validator{

    isUserAuthorized(request, response, next) {
        if (!request.session.token) {
            response.redirect('/');
        } else {
            next();
        }
    }

    loginValid(data) {
        let errors = {};

        if (this.isEmpty(data.email)) errors.email = 'Must not be empty';
        if (this.isEmpty(data.password)) errors.password = 'Must not be empty';
    
        return {
            errors,
            valid: Object.keys(errors).length === 0 ? true : false
        };
    }

    registerValid(data) {
        let errors = {};

        if (this.isEmpty(data.email)) {
            errors.email = 'Must not be empty';
        } else if (!this.isEmail(data.email)) {
            errors.email = 'Must be valid email address';
        }

        if (this.isEmpty(data.password)) errors.password = 'Must not be empty';
        if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords must be the same';
    
        return {
            errors,
            valid: Object.keys(errors).length === 0 ? true : false
        };

    }

    userUpdateValid(data) {
        let errors = {};

        if (this.isEmpty(data.email)) {
            errors.email = 'Must not be empty';
        } else if (!this.isEmail(data.email)) {
            errors.email = 'Must be valid email address';
        }
    
        if (this.isEmpty(data.firstName)) errors.firstName = 'Must not be empty';
        if (this.isEmpty(data.lastName)) errors.lastName = 'Must not be empty';
    
        if (this.isEmpty(data.password)) errors.password = 'Must not be empty';
        if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords must be the same';
        if (this.isEmpty(data.username)) errors.username = 'Must not be empty';
    
        return {
            errors,
            valid: Object.keys(errors).length === 0 ? true : false
        };

    }

    isEmail(email){
        const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (email.match(emailRegEx)) return true;
        else return false;
    }

    isEmpty(string) {
        if (string.trim() === '') return true;
        else return false;
    };

}
module.exports = Validator;