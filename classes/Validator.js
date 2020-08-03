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
        if (data.password !== data.passwordConfirm) {
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

    makeSlug(str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();
        
        // remove accents, swap ñ for n, etc
        var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
        var to   = "aaaaeeeeiiiioooouuuunc------";
        for (var i=0, l=from.length ; i<l ; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }
    
        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes
    
        return str;
    }

    isEmpty(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }

}
module.exports = Validator;