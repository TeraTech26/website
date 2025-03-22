
console.log("Script loaded");

function checkLogin(first = true) {
    //test si l'utilisateur est connecté avec le cookie
    if (getCookie("token") == "") {
        window.location.href = "login.html";
    }
   fetch("/api/getLink").then(response => response.json()).then(apps => {
        loadApps(apps);
    }
    );
    if (first) updateClock();
}
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}
// Chargement des applications
function loadApps(apps) {
    const appGrid = document.getElementById("appGrid");
    appGrid.innerHTML = "";

    apps.forEach(app => {
        const appElement = document.createElement("div");
        appElement.className = "app";
        appElement.onclick = () => {
            if (editMode) {
                openEditAppPopup(app);
                return;
            }
            window.open(app.link);
        };
        appElement.oncontextmenu = event => {
            event.preventDefault();
            if (editMode) {
                openEditAppPopup(app);
                return;
            }
        };

        // Favicon dynamique
        console.log(app);
        const faviconUrl = app.img	;
        const icon = document.createElement("img");
        icon.src = faviconUrl;
        icon.alt = `${app.name} Icon`;

        const name = document.createElement("div");
        name.textContent = app.name;

        appElement.appendChild(icon);
        appElement.appendChild(name);
        appGrid.appendChild(appElement);
    });
    // Ajout de l'application "Ajouter"
    const addAppElement = document.createElement("div");
    addAppElement.className = "app";
    addAppElement.id = "addApp";
    addAppElement.style.display = "none";
    addAppElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>`;

    addAppElement.onclick = () => {
        const popup = document.getElementById("popup-add-app");
        popup.style.display = "flex";
        document.getElementById("appName").focus();
        document.getElementById("appName").value = "";
        document.getElementById("appUrl").value = "";
        document.getElementById("appIconUrl").value = "";
        document.getElementById("addAppBtn").style.display = "initial";
        document.getElementById("editAppBtn").style.display = "none";
        document.getElementById("removeAppBtn").style.display = "none";
        const newIndexDiv = document.getElementsByClassName("newIndex")
        for (let i = 0; i < newIndexDiv.length; i++) {
            newIndexDiv[i].style.display = "none";
        }
        const appIcon = document.getElementById("appIcon");
        appIcon.innerHTML = "<p>aucune icone disponible</p>";
        
        
    };
    appGrid.appendChild(addAppElement);
    document.body.appendChild(appGrid);
}

// Mise à jour de l’horloge
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    document.getElementById("clock").textContent = `${hours}:${minutes}:${seconds}`;
    requestAnimationFrame(updateClock);
}

// Déconnexion
function logout() {
    fetch("/api/logout").then(() => {
        window.location.href = "";
    });
}


//passe en mode edit
let editMode = false;
function toggleEditMode(force=!editMode) {
    editMode = force;
    //pour chaque classe app, on ajoute ou retire la classe editMode
    document.querySelectorAll(".app").forEach(app => {
        app.classList.toggle("editMode", editMode);
    });
    document.getElementsByClassName("edit-btn")[0].classList.toggle("editMode", editMode);
    document.body.classList.toggle("editMode", editMode);
    //on affiche ou cache le bouton de suppression
    document.querySelectorAll(".editApp").forEach(editAppButton => {
        editAppButton.style.display = editMode ? "block" : "none";
    });
    //on affiche ou cache le bouton d'ajout
    document.getElementById("addApp").style.display = editMode ? "block" : "none";
}
document.getElementById("popup-add-app").addEventListener("click", event => {
    if (event.target.id === "popup-add-app") {
        event.target.style.display = "none";
    }
});
function closePopup() {
    document.getElementById("popup-add-app").style.display = "none";
}
function updateAppIcone() {
    const appIcon = document.getElementById("appIcon");
    const appUrl = document.getElementById("appUrl").value;
    if (appUrl) {
        appIcon.innerHTML = `<p>Chargement...</p>`;
        fetch("/api/getImgFromLink", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                link: appUrl
            })
        }).then(response => response.json()).then(data => {
            appIcon.innerHTML = "";
            if (data.length > 0) {
                data.forEach(img => {
                    console.log(img);
                    if (img.name.includes("avicon")) {
                        if (img.name == "largestFavicon") {
                            creatCard();
                        }
                        return;

                    }

                    function creatCard() {
                        const card = document.createElement("div");
                        card.className = "card-img";
                        card.innerHTML = `<img src="${img.url}" alt="${img.name}"> <p>${img.name}</p>`;
                        card.addEventListener("click", () => {
                            document.getElementById("appIconUrl").value = img.url;
                            const cards = document.getElementsByClassName("card-img") ?? [];
                            for (let i = 0; i < cards.length; i++) {
                                cards[i].classList.remove("selected");
                            }
                            card.classList.add("selected");
                        });
                        appIcon.appendChild(card);
                    }
                    creatCard();
                });
            }else{
                appIcon.innerHTML = `<p>aucune icone disponible</p>`;
            }
        });
    }else{
        appIcon.innerHTML = "<p>aucune icone disponible</p>";
    }
}


function addApp() {
    const appName = document.getElementById("appName").value;
    const appUrl = document.getElementById("appUrl").value;
    const appIconUrl = document.getElementById("appIconUrl").value;
    if (!(appName && appUrl && appIconUrl)) {
        return;
    }
    fetch("/api/addLink", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: appName,
            link: appUrl,
            img: appIconUrl
        })
    }).then(response => {
        if (response.ok) {
            checkLogin(false);
            closePopup();
            toggleEditMode(false)
        }else{
            console.log(response);
        }
    });
}
function openEditAppPopup(app) {
    const popup = document.getElementById("popup-add-app");
    popup.style.display = "flex";
    document.getElementById("appName").focus();
    document.getElementById("appId").value = app.id;
    document.getElementById("appName").value = app.name;
    document.getElementById("appUrl").value = app.link;
    document.getElementById("appIconUrl").value = app.img;
    document.getElementById("appPosition").value = app.id;
    document.getElementById("addAppBtn").style.display = "none";
    document.getElementById("editAppBtn").style.display = "initial";
    document.getElementById("removeAppBtn").style.display = "initial";
    const newIndexDiv = document.getElementsByClassName("newIndex")
    for (let i = 0; i < newIndexDiv.length; i++) {
        newIndexDiv[i].style.display = "initial";
    }
    updateAppIcone()
}

function deleteApp() {
    const appId = document.getElementById("appId").value;
    fetch("/api/removeLink", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            index: appId
        })
    }).then(response => {
        if (response.ok) {
            checkLogin(false);
            closePopup();
            toggleEditMode(false)
        }else{
            console.log(response);
        }

    });
}
function editApp() {
    const appId = document.getElementById("appId").value;
    const appName = document.getElementById("appName").value;
    const appUrl = document.getElementById("appUrl").value;
    const appIconUrl = document.getElementById("appIconUrl").value;
    const newPosition = document.getElementById("appPosition").value;
    
    if (!(appName && appUrl && appIconUrl)) {
        return;
    }
    fetch("/api/updateLink", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            index: appId,
            name: appName,
            link: appUrl,
            img: appIconUrl,
            newIndex: newPosition
        })
    }).then(response => {
        if (response.ok) {
            checkLogin(false);
            closePopup();
            toggleEditMode(false)
        }else{
            console.log(response);
        }
    });
}