var express = require("express");
var router = express.Router();
 
router.ws('/echo', function(ws, req) {
  ws.on('message', function(msg) {
    ws.send(msg);
    console.log('Socket received message: ' + msg);
  });
});
 
module.exports = router;