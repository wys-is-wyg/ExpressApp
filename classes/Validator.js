class Validator{

    loginValid(data) {
        let errors = [];

        if (this.isEmpty(data.email)) errors.push('You need to add an email');
        if (this.isEmpty(data.password)) {
            errors.push('You need to include a password');
        } else if (data.password.length < 6) {
            errors.push('Your password must be at least 6 characters in length');
        }
    
        return {
            errors,
            valid: errors.length === 0 ? true : false
        };
    }

    registerValid(data) {
        let errors = [];
        if (this.isEmpty(data.email)) errors.push('You need to add an email');
        if (this.isEmpty(data.password)) {
            errors.push('You need to include a password');
        } else if (data.password.length < 6) {
            errors.push('Your password must be at least 6 characters in length');
        } 
        if (data.password !== data.passwordConfirm) {
            errors.push('Your passwords must both match');
        }
        return {
            errors,
            valid: errors.length === 0 ? true : false
        };

    }

    updateUserValid(data) {
        let errors = [];

        if (this.isEmpty(data.email)) errors.push('You need to add an email');
        if (this.isEmpty(data.displayName)) errors.push('You need to include a display name');
    
        return {
            errors,
            valid: errors.length === 0 ? true : false
        };

    }

    updatePasswordValid(data) {
        let errors = [];

        if (this.isEmpty(data.password)) {
            errors.push('You need to include a password');
        }
        if (data.password.length < 6) {
            errors.push('Your password must be at least 6 characters in length');
        } 
        if (data.password !== data.confirmPassword) {
            errors.push('Your passwords must both match');
        }
    
        return {
            errors,
            valid: errors.length === 0 ? true : false
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