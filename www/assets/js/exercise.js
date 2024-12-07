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

db.collection("questions").get().then((select) => {
    const data = select.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    let accordion = "";
    data.forEach(element => {
        accordion += `<details id="details-${element.number}" class="group" ${new URL(window.location.href).searchParams.get("number") == element.number ? "open" : "" }>
            <summary class="flex cursor-pointer list-none items-center justify-between p-4 text-lg font-medium text-indigo-900 dark:text-indigo-100 group-open:bg-indigo-50 dark:group-open:bg-indigo-900/20 truncate">
            ${element.number}. ${element.question.slice(0,50)} . . .
              <div class="text-indigo-500 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="block h-5 w-5 transition-all duration-300 group-open:rotate-180">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </summary>
            <div class="border-t border-t-stone-100 dark:border-t-stone-700 p-4 text-indigo-500 dark:text-indigo-400">
                <div class="bg-gray-800">
                    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center">
                        <div class="lg:w-0 lg:flex-1">
                            <h2 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl" id="newsletter-headline"></h2>
                            <p class="mt-3 max-w-3xl text-lg leading-6 text-gray-300">${element.question}</p>
                        </div>
                        <div class="mt-8 lg:mt-0 lg:ml-8">
                            <form class="sm:flex question" data-answer="${element.answer}" data-id="${element.id}">
                                <label for="answer" class="sr-only">Answer</label>
                                <input id="${element.id}" name="answer" type="number" autocomplete="email" required class="w-full px-5 py-3 border border-transparent placeholder-gray-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white focus:border-white sm:max-w-xs rounded-md" placeholder="Enter your answer">
                                <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                                    <button type="submit" class="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
          </details>`;
    });
    q("#answer-accordion").innerHTML = accordion;
    a(".question").forEach((form) => {
        form.onsubmit = (e) => {
            e.preventDefault();
            if (sessionStorage.getItem("loggedin") == "true") {
                if (q("#" + form.dataset.id).value == form.dataset.answer) {
                    db.collection("profile").doc(sessionStorage.userID).get().then((select) => {
                        let data = select.data();
                        if (data) {
                            let answered = [...data.answered];
                            if (answered.indexOf(form.dataset.id) == -1) {
                                answered.push(form.dataset.id);
                                db.collection('profile').doc(sessionStorage.userID).update({"answered":answered}).then(() => {
                                    toastr.success("Successfully updating answered questions on profile");
                                    console.log("Successfully updating answered questions on profile");
                                })
                                .catch((error) => {
                                    toastr.error("Error updating answered questions:" + error.message)
                                    console.error("Error updating answered questions:", error.message);
                                });
                            }
                        } else {
                            db.collection('profile').doc(sessionStorage.userID).set({"answered":[form.dataset.id]}).then(() => {
                                toastr.success("Successfully creating profile");
                                console.log("Successfully creating profile");
                            })
                            .catch((error) => {
                                toastr.error("Error creating profile:" + error.message)
                                console.error("Error creating profile:", error.message);
                            });
                        }
                    })
                    .catch((error) => {
                        toastr.error("Error getting answered questions:" + error.message)
                        console.error("Error getting answered questions:", error.message);
                    });
    
                    toastr.success("Correct Answer");
                } else {
                    toastr.error("Wrong Answer");
                }
            } else {
                toastr.error("Sign In to Submit Answer");
            }
        };
    });
    let opened;
    a("details").forEach((e) => {
        e.ontoggle = (ev) => {
            if (ev.newState == "open") {
                opened = e.id;
                a("details").forEach((el) => {
                    if (el.getAttribute("open") != null && el.id != opened) {
                        el.removeAttribute("open");
                    }
                });
            } else {
                opened = null;
            }
        };
    });
})
.catch((error) => {
    toastr.error("Error getting questions:" + error.message)
    console.error("Error getting questions:", error.message);
});

q("#playground").onclick = () => {
    window.location.href = "lab.html";
};
q("#home").onclick = () => {
    window.location.href = "/";
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