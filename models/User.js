
class User{

    constructor(){
        this.user = false;
        this.get_user();
    }

    is_logged_in(){
        this.get_user();
        return (typeof this.user  === 'object');
    }
    
    get_user(req){
        this.user = req.session.user;
        return this.user;
    }
    
    get_user_id(){
        if (this.is_logged_in()) {
            return this.user.localId;
        }
        return false;
    }
    
    get_user_id_token(){
        if (this.is_logged_in()) {
            return this.user.idToken;
        }
        return false;
    }

    set_user(req, user){
        req.session.user = user;
        this.get_user();
    }

    unset_user(req){
        this.user = false;
        req.session.user = false;
        req.session.destroy(() => {
            res.status(200);
            res.redirect('/');
        });
    }
}
        