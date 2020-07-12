var firebase = require("firebase");    

class Database{

    constructor(){
        var firebaseConfig = require('./../firebase.json');
        var firebaseAdmin = require("firebase-admin");
        var firebaseAdminConfig = require('./../firebase.admin.json');
        this.firebase = firebase.initializeApp(firebaseConfig);
        this.auth = firebase.auth();
        this.firebaseAdmin = firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(firebaseAdminConfig),
            databaseURL: "https://gulp-ara.firebaseio.com"
        });
        //this.extensions = [".png", ".jpg", ".jpeg", ".gif"];
    }
    
    upload(file){
        if (this.allowed_file(file.filename)) {
            user = User();
            user_id_token = user.get_user_id_token();
            user_id = user.get_user_id();
            var tmp = require('tmp');
            var path = require('path');
            var ext = path.extname(file);
            var temp = tmp.fileSync({ mode: '0644', prefix: user_id, postfix: ext });
            storage = this.firebase.storage();
            result = storage.child(new_name).put(temp.name, user_id_token);
            console.log(result);
            return result;

        } else {
            console.log("Only allowed filetypes: ".join(this.extensions.join()));
        }
    }

    allowed_file(filename){
        return this.extensions.includes(filename.split('.').pop());
    }

}
module.exports = Database;