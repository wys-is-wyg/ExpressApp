import firebase from 'firebase';

class Database{

    UPLOAD_FOLDER = 'public/uploads';

    constructor(){

        var firebaseConfig = {
            apiKey: "AIzaSyBqQRuQvIb9QgWIz5AqYVOXJdS8WNMm8N8",
            authDomain: "gulp-ara.firebaseapp.com",
            databaseURL: "https://gulp-ara.firebaseio.com",
            projectId: "gulp-ara",
            storageBucket: "gulp-ara.appspot.com",
            messagingSenderId: "1034641616597",
            appId: "1:1034641616597:web:a838936f6047c160c73c5c"
          };
        this.firebase = firebase.initializeApp(firebaseConfig);
        this.extensions = {'png', 'jpg', 'jpeg', 'gif'};
        this.auth = this.firebase.auth();
        this.readable_errors = {
            "INVALID_PASSWORD": "This is an invalid password",
            "EMAIL_NOT_FOUND": "This email has not been registered",
            "EMAIL_EXISTS": "This email already exists. Try logging in instead.",
            "TOO_MANY_ATTEMPTS_TRY_LATER": "Too many attempts, please try again later",
            "USER_DISABLED": "This account has been disabled by an administrator.",
        };
    }
        
    register(email, password){
        try:
            user_auth = this.auth.create_user_with_email_and_password(email, password);
        except requests.exceptions.HTTPError as error:
            readable_error = this.get_readable_error(error);
            raise Exception(readable_error);
    }

    login(email, password){
        try:
            user_auth = this.auth.sign_in_with_email_and_password(email, password);
            firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // ...
              });
            user = User();
            user.set_user(user_auth);
            return user_auth;
        except requests.exceptions.HTTPError as error:
            readable_error = this.get_readable_error(error);
            raise Exception(readable_error);
    }

    logout(this){
        user = User();
        user.unset_user();
    }

    upload(file){

        if this.allowed_file(file.filename){
            try:
                user = User();
                user_id_token = user.get_user_id_token();
                user_id = user.get_user_id();
                temp = tempfile.NamedTemporaryFile(prefix=user_id, delete=False);
                file.save(temp.name);
                filename, file_extension = os.path.splitext(file.filename);
                new_name = temp.name.split("\\")[-1] + file_extension;
                storage = this.firebase.storage();
                result = storage.child(new_name).put(temp.name, user_id_token);
                return result;
            except requests.exceptions.HTTPError as error:
                readable_error = this.get_readable_error(error);
                raise Exception(readable_error);
        else:
            raise Exception("Only allowed filetypes: ".join(this.extensions.values()));
        }
    }

    allowed_file(filename){
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in this.extensions;
    }

    get_readable_error(error){
        error_json = error.args[1];
        error_messsage = json.loads(error_json)['error']['message'];
        if error_messsage in this.readable_errors.keys(): 
            return this.readable_errors[error_messsage];
        else: 
            return "There was a problem with your request.";
    }
}