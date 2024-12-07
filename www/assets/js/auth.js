const firebaseConfig = {
    apiKey: "AIzaSyBariyhqYTrLxNpNp_qNLFGZCrGm533E0M",
    authDomain: "relativitylab.firebaseapp.com",
    projectId: "relativitylab",
    storageBucket: "relativitylab.appspot.com",
    messagingSenderId: "296786551041"
};

firebase.initializeApp(firebaseConfig);

const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();
const db = firebase.firestore();

let user;

function signInWithGoogle() {
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            user = result.user;
            sessionStorage.setItem("loggedin", "true");
            sessionStorage.setItem("displayName", user.displayName);
            sessionStorage.setItem("photoURL", user.photoURL);
            sessionStorage.setItem("emailAddress", user.email);
            sessionStorage.setItem("userID", user.uid);

            q("#login").innerText = "Log Out";
            q("#login").onclick = signOut;

            q("#profile-container").innerHTML = `<button type="button" id="profile" class="navbar-transparent-button"><img class="inline-block h-10 w-10 rounded-full" src="${user.photoURL}"/></button>`;
            q("#profile").onclick = () => {
                window.location.href = "profile.html";
            };

            console.log("User signed in:", user);
        })
        .catch((error) => {
            console.error("Error during sign-in:", error);
        });
}

function signOut() {
    firebase.auth().signOut().then(() => {
        sessionStorage.clear();

        q("#login").innerText = "Login with Google";
        q("#login").onclick = signInWithGoogle;
        q("#profile-container").innerHTML = "";

        console.log("User signed out.");

        if (window.location.pathname != "/") {
            window.location.href = "/";
        }
    }).catch((error) => {
        console.error("Sign out error:", error);
    });
}