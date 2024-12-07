toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};

q("#home").onclick = () => {
    window.location.href = "/";
};
q("#playground").onclick = () => {
    window.location.href = "lab.html";
};
q("#exercise").onclick = () => {
    window.location.href = "exercise.html";
};

if (sessionStorage.getItem("loggedin") == "true") {
    q("#login").innerText = "Log Out";
    q("#login").onclick = signOut;
    q("#profile-container").innerHTML = `<button type="button" id="profile" class="navbar-transparent-button"><img class="inline-block h-10 w-10 rounded-full" src="${sessionStorage.getItem("photoURL")}"/></button>`;
    q("#profile").onclick = () => {
        window.location.href = "profile.html";
    };

    q("#displayName").innerText = sessionStorage.getItem("displayName");
    q("#displayPhoto").src = sessionStorage.getItem("photoURL");
    q("#emailAddress").innerText = sessionStorage.getItem("emailAddress");
} else {
    window.location.href = "/";
}

db.collection("profile").doc(sessionStorage.userID).get().then((select) => {
    let data = select.data();
    if (data) {
        let answered = [...data.answered];
        let answerdHTML = "";
        db.collection("questions").get().then((select) => {
            const data = select.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            data.forEach(element => {
                if (answered.indexOf(element.id) > -1) {
                    answerdHTML += `<a href="/exercise.html?number=${element.number}" class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">No #${element.number}</a>`;
                }
            });
            q("#solvedQuestions").innerHTML = answerdHTML;
        });
    }
})
.catch((error) => {
    toastr.error("Error getting answered questions:" + error.message)
    console.error("Error getting answered questions:", error.message);
});