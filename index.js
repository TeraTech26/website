const micuitDb = require('micuit-db');
const Log = require("mi-log")
const express = require("express")

const log = new Log([{
    text: "micuit-db",
    color: "blue"
}])

const app = express()

//pour l'utilisation de cookie
app.use(require('cookie-parser')())
app.use(express.json())

app.use(require('./route.js'))



// app.get("*", async (req, res, next) => {
//     log.i(req.url)
//     next()
// }
// )
// app.post("*", async (req, res, next) => {
//     log.i(req.url)
//     next()
// }
// )

// app.get("/", async (req, res) => {
//     res.sendFile(__dirname + "/dist/index.html")
// })
// app.get("/style.css", async (req, res) => {
//     res.sendFile(__dirname + "/dist/style.css")
// })

// app.get("/liens_perso/index_liens.html", async (req, res) => {
//     res.redirect("/liens_perso")
// })

// app.get("/liens_perso", async (req, res) => {
//     //optien le cookie de connection
//     const token = req.cookies.token
//     //verifie si le cookie est bien present
//     if (!token) {
//         res.redirect("/liens_perso/login")
//         return
//     }
//     //verifie si le cookie est bien un token
//     micuitDb.models.user.findOne({
//         where: {
//             token: token
//         }
//     }).then(user => {
//         if (!user) {
//             res.redirect("/liens_perso/login")
//             return
//         }
//         res.sendFile(__dirname + "/dist/liens_perso/index_liens.html")
//     })
// })

// app.get("/liens_perso/login", async (req, res) => {
//     res.sendFile(__dirname + "/dist/liens_perso/login.html")
// })

// app.get("/liens_perso/script.js", async (req, res) => {
//     res.sendFile(__dirname + "/dist/liens_perso/script.js")
// })
// app.get("/liens_perso/style.css", async (req, res) => {
//     res.sendFile(__dirname + "/dist/liens_perso/style.css")
// })




app.listen(5500, async () => {
    await micuitDb.sync();
    log.i("Server is running on port 3000(http://localhost:5500)")
})