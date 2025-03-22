const express = require('express');
const router = express.Router();
const favicon = require('./favicon.js');

const micuitDb = require("micuit-db")
const Log = require("mi-log")
const log = new Log([{
    text: "micuit-db",
    color: "blue"
}, {
    text: "API",
    color: "green"
}])

router.post("/login", async (req, res) => {
    log.i(req.body)
    const username = req.body.username
    const password = req.body.password
    if (!username || !password|| username.length < 3 || password.length < 3 || username.length > 20 || password.length > 20) {
        log.e("Invalid username or password, username or password is too short")
        res.redirect("/liens_perso/login?error=1")
        return
    }
    //casse les sql injection
    if (username.includes("'") || password.includes("'")) {
        log.e("Invalid username or password, username or password contains a single quote")
        res.redirect("/liens_perso/login?error=1")
        return
    }

    micuitDb.models.user.findOne({
        where: {
            name: username,
            password: password
        }
    }).then(user => {
        log.i(user)
        if (!user) {
            res.redirect("/liens_perso/login?error=1")
            return
        }
        const token = Math.random().toString(36).substring(7)
        user.token = token
        user.save().then(() => {
            res.cookie("token", token)
            res.send("ok")
        })
    })
})
router.get("/getLink", async (req, res) => {
    if (!req.cookies.token) {
        res.redirect("/liens_perso/login")
        return
    }
    micuitDb.models.user.findOne({
        where: {
            token: req.cookies.token
        }
    }).then(user => {
        if (!user) {
            res.redirect("/liens_perso/login")
            return
        }
        res.json(user.link.map((link, index) => {
            return {
                name: link.name,
                link: link.link,
                img: link.img,
                id: index
            }
        }
        ))
    })
})
router.get("/logout", async (req, res) => {
    res.clearCookie("token")
    //supppprime le token
    micuitDb.models.user.findOne({
        where: {
            token: req.cookies.token
        }
    }).then(user => {
        if (!user) {
            res.redirect("/liens_perso/login")
            return
        }
        user.token = null
        user.save().then(() => {
            res.redirect("/liens_perso/login")
        })
    })
})
router.post("/getImgFromLink", async (req, res) => {
    const link = req.body.link
    if (!link) {
        res.json([])
        return
    }
    favicon.autodectecteImages(link).then(imgList => {
        res.json(imgList)
    }).catch(err => {
        log.e("Error detecting images from link:", err)
        res.json([])
    })
})

router.post("/addLink", async (req, res) => {
    log.i("Adding link:", req.body)
    if (!req.cookies.token) {
        log.e("Error adding link: no token")
        res.redirect("/liens_perso/login")
        return
    }
    const url = req.body.link
    const name = req.body.name
    const img = req.body.img
    if (!url || !name || !img) {
        log.e("Error adding link:", req.body)
        res.send("error")
        return
    }
    micuitDb.models.user.findOne({
        where: {
            token: req.cookies.token
        }
    }).then(user => {
        if (!user) {
            log.e("Error adding link: no user")
            res.redirect("/liens_perso/login")
            return
        }
        let link = user.link || []
        log.d("Link array before adding:", JSON.stringify(link, null, 2));
        link.push({
            name: name,
            link: url,
            img: img
        })
        user.dataValues.link = [];// if delete this line, this program will not work
        user.set('link', link);
        user.save()
            .then(() => {
                log.d("Simple link added:", user.link);
                res.send("ok");
            })
            .catch(err => {
                log.e("Error saving simple link:", err);
                res.send("error");
            });
        
        

        
        
        
    }).catch(err => {
        log.e("Error finding user:", err)
        res.send("error")
    })
})


router.post("/removeLink", async (req, res) => {
    if (!req.cookies.token) {
        res.redirect("/liens_perso/login")
        return
    }
    const index = req.body.index
    log.i("Removing link:", index)
    if (!index) {
        log.e("Error removing link:", req.body)
        res.send("error")
        return
    }
    micuitDb.models.user.findOne({
        where: {
            token: req.cookies.token
        }
    }).then(user => {
        if (!user) {
            res.redirect("/liens_perso/login")
            return
        }
        user.link = user.link || []
        const link = user.link.filter((_, i) => i != index)
        user.dataValues.link = [];// if delete this line, this program will not work
        user.set('link', link);
        user.save().then(() => {
            res.send("ok")
        }).catch(err => {
            log.e("Error saving user:", err)
            res.send("error")
        })
    }).catch(err => {
        log.e("Error finding user:", err)
        res.send("error")
    })
})
router.post("/updateLink", async (req, res) => {
    if (!req.cookies.token) {
        res.redirect("/liens_perso/login")
        return
    }
    let index = req.body.index
    let link = req.body.link
    let img = req.body.img
    let name = req.body.name
    let newIndex = req.body.newIndex || index
    if (index == undefined){
        log.e("Error updating link:", req.body)
        res.send("error")
        return
    }
    micuitDb.models.user.findOne({
        where: {
            token: req.cookies.token
        }
    }).then(user => {
        if (!user) {
            res.redirect("/liens_perso/login")
            return
        }
        user.link = user.link || []
        if (!user.link[index]) {
            log.e("Error updating link:", req.body)
            res.send("error")
            return
        }
        const lastLink = user.link[index].link
        const lastName = user.link[index].name
        const lastImg = user.link[index].img
        const linkListe = user.link
        linkListe[index].link = link || lastLink
        linkListe[index].name = name || lastName
        linkListe[index].img = img || lastImg
        if (newIndex != index){
            //deplace le lien
            newIndex = Math.min(Math.max(newIndex, 0), linkListe.length- 1)
            const temp = linkListe[index]
            linkListe.splice(index, 1)
            linkListe.splice(newIndex, 0, temp)
            index = newIndex
        }
        user.dataValues.link = [];// if delete this line, this program will not work
        user.set('link', linkListe);

        user.save().then(() => {
            res.send("ok")
        }).catch(err => {
            log.e("Error saving user:", err)
            res.send("error")
        })
    }).catch(err => {
        log.e("Error finding user:", err)
        res.send("error")
    })
})

module.exports = router;