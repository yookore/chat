var amqp = require('rabbit.js').createContext('amqp://test:Wordpass15@192.168.10.29:5672')
var SockJS = require('sockjs-client')
var sockjs = require('sockjs')
//var Stomp = require('stompjs')
var app = require(__dirname + '/../server').app
var express = require(__dirname + '/../server').express
var server = require(__dirname + '/../server').server
var session = require('express-session')
var redis = require('./redis');
var redisClient = redis.redisClient
var mustache = require('mustache')
  , util = require("util")
  , events = require("events")
  , Promise = require('bluebird')
  , async = require('async')
  , _ = require('underscore')
  , url = require('url')

Promise.promisifyAll(redisClient)

app.set('views', './views')
app.set('view engine', 'mustache');
app.use('/static', express.static('static'));
app.use('/static', express.static('public'));
app.use('/static', express.static('files'));

function withContext(fn) {
    return fn(amqp);
}

var liveContext = function(fn) {
  return function() {
    withContext(function(ctx) {
      ctx.on('ready', function() {
        return fn(ctx)
      })
    })
  }
}
var sockjs_opts = {sockjs_url: "http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js"};

var conn_store = {}
var flatten = require('flat')
var unflatten = require('flat').unflatten
var SockServer = sockjs.createServer(sockjs_opts);
SockServer.on('connection', function(conn) {
  var userpath = conn.url
  var userid = userpath.split('/')[3]
  var flatten_conn = util.inspect(conn, {showHidden: false, depth: null})
  // store the conn
  //redisClient.hmset('sockjs_sess_conn_' + userid, flatten_conn)
  //conn_store.push({'sockjs_sess_conn_' + userid: flatten_conn})
  conn_store['sockjs_sess_conn_' + userid] = flatten_conn
  console.log("Identified server conn", conn)
  conn.on('data', function(msg) {
    console.log("message received on server:", JSON.parse(msg))
    message = JSON.parse(msg)
    // get the recipient's id in the message
    recipientid = message.recipientid
    // match it with the stored conn to retrieve recipient conn
    recpt_conn = conn_store['sockjs_sess_conn_' + recipientid]
    console.log(recpt_conn)
    if (recpt_conn) {
      conn.write(JSON.stringify(message))
    }
    /*redisClient.hgetallAsync('sockjs_sess_conn_' + recipientid).then(function(recpt_conn) {
      console.log('conn:', recpt_conn)
      if (recpt_conn) {
        recpt_conn.write(message)
      }
    })*/
  });
});

SockServer.installHandlers(server, {prefix:'/im'});

// onlogin, create new sockjs client prefixed with user sessionid
// var usersocket = new SockJS('http://mydomain.com/my_prefix/sessionid');
// store this client connection
// store[username_sockclient] = usersocket
/*Queue.on('user_login', function(params) {
  var username = params.username
})

var sock = new SockJS('http://localhost:3007/im');
sock.onopen = function() {
   console.log('open');
};
// onmessage, get the recipient client based on userid or username
sock.onmessage = function(e) {
  // send the message using the recipient client's context
  console.log('message', e.data);
  // usersocket.send(new Message({}))
};
sock.onclose = function() {
   console.log('close');
};*/

/**
 * A new client socket is created whenever 
 * a user logs in
 */ 
function ClientSocket(options) {

}

function Message(data) {
  return { 
    message: {
      from: {},
      data: {}
    }
  }
}

app.get('/', function(req, res) {
  var template = require('fs').readFileSync(__dirname + '/../views/index.mustache', 'utf8')
  // make async call to /stats
  /*UserStat.all(function(err, result) {
    if (err) return res.status(404).send(err)
    var indexPage = mustache.render(template, result )
    return res.send(indexPage)
  })*/
  var user = req.query.sid ? req.query.sid : 'anon'
  var indexPage = mustache.render(template, {username: user})
  return res.send(indexPage)
})

require('./pubsub')
