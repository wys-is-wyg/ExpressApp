// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBqQRuQvIb9QgWIz5AqYVOXJdS8WNMm8N8",
    authDomain: "gulp-ara.firebaseapp.com",
    databaseURL: "https://gulp-ara.firebaseio.com",
    projectId: "gulp-ara",
    storageBucket: "gulp-ara.appspot.com",
    messagingSenderId: "1034641616597",
    appId: "1:1034641616597:web:a838936f6047c160c73c5c"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

/**
 * Handles the sign in button press.
 */
function toggleSignIn() {
    if (firebase.auth().currentUser) {
        firebase.auth().signOut();
    } else {
        var email = document.getElementById('sign-in-email').value;
        var password = document.getElementById('sign-in-password').value;
        if (email.length < 4) {
            alert('Please enter an email address.');
            return;
        }
        if (password.length < 4) {
            alert('Please enter a password.');
            return;
        }
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
            alert('Wrong password.');
        } else {
            alert(errorMessage);
        }
        console.log(error);
        document.getElementById('sign-in').disabled = false;
        });
    }
    document.getElementById('sign-in').disabled = true;
}

function handleSignUp() {
    var email = document.getElementById('sign-up-email').value;
    var password = document.getElementById('sign-up-password').value;
    if (email.length < 4) {
      alert('Please enter an email address.');
      return;
    }
    if (password.length < 4) {
      alert('Please enter a password.');
      return;
    }
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode == 'auth/weak-password') {
        alert('The password is too weak.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
    });
}

function sendPasswordReset() {
    var email = document.getElementById('reset-email').value;
    firebase.auth().sendPasswordResetEmail(email).then(function() {
      alert('Password Reset Email Sent!');
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode == 'auth/invalid-email') {
        alert(errorMessage);
      } else if (errorCode == 'auth/user-not-found') {
        alert(errorMessage);
      }
      console.log(error);
    });
  }

function initApp() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = '/account';
        } else {

        }
    });

    document.getElementById('sign-in').addEventListener('click', toggleSignIn, false);
    document.getElementById('sign-up').addEventListener('click', handleSignUp, false);
    document.getElementById('password-reset').addEventListener('click', sendPasswordReset, false);
}

window.onload = function() {
    initApp();
};
