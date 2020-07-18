
class User{

    constructor(firebaseUser = false){
        this.user = firebaseUser;
        this.getUser();
    }

    isLoggedIn(){
        this.getUser();
        return (typeof this.user  === 'object');
    }
    
    getUser(req){
        this.user = req.session.user;
        return this.user;
    }
    
    getUserId(){
        if (this.isLoggedIn()) {
            return this.user.localId;
        }
        return false;
    }
    
    getUserIdToken(){
        if (this.isLoggedIn()) {
            return this.user.idToken;
        }
        return false;
    }

    setUser(req, user){
        req.session.user = user;
        this.getUser();
    }

    unsetUser(req){
        this.user = false;
        req.session.user = false;
        req.session.destroy(() => {
            res.status(200);
            res.redirect('/');
        });
    }
}
module.exports = User;