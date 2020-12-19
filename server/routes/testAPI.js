var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("IP: " + ip);
    res.send("API is working properly " + ip);
});

module.exports = router;