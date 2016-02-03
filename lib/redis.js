var config = require(__dirname + '/../config')();
//var session = require('express-session');
//var RedisStore = require('connect-redis')(session);
console.log('Running in ' + config.mode + ' environment.');

var cfenv = require(__dirname + '/../config').cfenv
//var redisClientPass = !cfenv.isLocal ? config.redis.password : null
var redisOptions = {
  no_ready_check: true,
  auth_pass: config.redis.password
}
var redisClient = undefined
if (cfenv.isLocal) {
  redisClient = require('redis').createClient(config.redis.port, config.redis.host, redisOptions)
}
else {
  var Redis = require('ioredis')
  redisClient = new Redis.Cluster(config.redis.cluster)
}
//var Redis = require('ioredis')
//redisClient = new Redis()

redisClient.on('connect', function() {
  console.log('Redis connected');
})

redisClient.on("error", function (err) {
    console.log("Error " + err);
});

var roptions = {
  client: redisClient
};

//var redisSessionStore = new RedisStore(roptions);
exports = module.exports = {};
exports.redisClient = redisClient;
//exports.redisSessionStore = redisSessionStore;
