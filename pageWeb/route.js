const express = require('express');
const router = express.Router();
const Log = require("mi-log")

const log = new Log([{
    text: "micuit-db",
    color: "blue"
}, {
    text: "router",
    color: "red"
}])



router.get("*", async (req, res, next) => {
    log.i(req.url)
    next()
})

router.post("*", async (req, res, next) => {
    log.i(req.url)
    next()
})

// router.use(favicon(__dirname + '/favicon.ico'));
router.use(express.static(__dirname + '/dist'));
router.get('/api-docs', (req, res) => {
    res.sendFile(__dirname + '/dist/api.html');
})
router.get('/', (req, res) => {
    res.sendFile(__dirname + '/dist/index.html');
});
router.get('/liens_perso/index_liens', (req, res) => {
    res.sendFile(__dirname + '/dist/liens_perso/index_liens.html');
});
router.get('/liens_perso/login', (req, res) => {
    res.sendFile(__dirname + '/dist/liens_perso/login.html');
});
router.get('/liens_perso', (req, res) => {
    res.sendFile(__dirname + '/dist/liens_perso/index_liens.html');
});
router.use('/api', require('./api'));


module.exports = router;