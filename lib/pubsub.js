var amqp = require('./socket').amqp
  //, redis = require(__dirname + '/../user/redis')
  //, redisClient = redis.redisClient
  //, Promise = require('bluebird')
  //, auth = require(__dirname + '/../auth').auth
  , util = require('util')
  , events = require('events')

//Promise.promisifyAll(redisClient);

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

/**function Queue() {

  var self = this
  events.EventEmitter.call(this);
}*/
//util.inherits(Queue, events.EventEmitter);
//module.exports = Queue

amqp.on('ready', function() {
  console.log("PUBLISHING")
  
  var worker = amqp.socket('WORKER');
  worker.setEncoding('utf8');

  (function Queue() {
//console.log(this)
    
    var self = this
    events.EventEmitter.call(this);
    
    var subscribe = amqp.socket('SUB', {routing: 'direct', noCreate: true});
    
    // Connect to multiple sub exchange
    SubExchange = (function() {
      subscribe.connect('user', 'signupverifyemailnotifyreply')
      subscribe.connect('user', 'resetpassemailverifynotifyreply')
    })();

    // Retrieve data based on binding key
    subscribe.on('data', function(msg) {
      console.log("Subscribed:", msg.toString())
      var data = JSON.parse(msg.toString())
      if (data.bindingKey) {
        switch(data.bindingKey) {

          case 'user_login':
            // fire an event
            self.emit('user_login', data)
            break
        }
      }
    })
  })();
})
