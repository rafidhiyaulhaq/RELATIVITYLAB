q("#playground").onclick = () => {
    window.location.href = "lab.html";
};
q("#exercise").onclick = () => {
    window.location.href = "exercise.html";
};
q("#explore").onclick = () => {
    window.location.href = "lab.html";
};

if (sessionStorage.getItem("loggedin") == "true") {
    q("#login").innerText = "Log Out";
    q("#login").onclick = signOut;
    q("#profile-container").innerHTML = `<button type="button" id="profile" class="navbar-transparent-button"><img class="inline-block h-10 w-10 rounded-full" src="${sessionStorage.getItem("photoURL")}"/></button>`;
    q("#profile").onclick = () => {
        window.location.href = "profile.html";
    };
} else {
    q("#login").innerText = "Login with Google";
    q("#login").onclick = signInWithGoogle;
    q("#profile-container").innerHTML = "";
}