//var config = require('./config')()
var express = require('express')
var app = express()

// start http server
var server = app.listen(3001, function () {

  process.setMaxListeners(0);
  var host = server.address().address
  var port = server.address().port

  console.log('User Account Service app listening at http://%s:%s', host, port)

})

exports = module.exports = {}
exports.express = express
exports.app = app
exports.server = server
