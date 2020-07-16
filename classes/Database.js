class Database{

    constructor(){
        
        if (typeof this.instance === 'object') {
            return this.instance;
        }

        var firebase = require("firebase");   
        var firebaseConfig = require('./../firebase.json');
        var firebaseAdmin = require("firebase-admin");
        var firebaseAdminConfig = require('./../firebase.admin.json');
        this.firebase = firebase.initializeApp(firebaseConfig);
        this.auth = firebase.auth();
        this.firebaseAdmin = firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(firebaseAdminConfig),
            storageBucket: firebaseConfig.storageBucket,
        });
        this.bucket = firebaseAdmin.storage().bucket();
        this.instance = this;
        return this;
    }

}
module.exports = Database;