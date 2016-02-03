var url = require('url')
var cfenv = require("cfenv")
var appEnv = cfenv.getAppEnv()
var rabbitUri = null
var redisups = null

if(!appEnv.isLocal) {
  // rabbit ups
  rabbitService = appEnv.getService('rabbitmq')
  rabbitCreds = rabbitService.credentials
  var rabbitObj = {
    protocol: 'amqp',
    slashes: true,
    auth: [rabbitCreds.username, rabbitCreds.password].join(':'),
    hostname: rabbitCreds.host,
    port: rabbitCreds.port
  }
  rabbitUri = url.format(rabbitObj)

  // redis ups
  redisups = appEnv.getService('redis')
  console.log("redisups", redisups)
}

var vcap_services;
var vcap_application
if(process.env.VCAP_SERVICES) {
  vcap_services = JSON.parse(process.env.VCAP_SERVICES)
  console.log(vcap_services)
}
if(process.env_VCAP_APPLICATION) {
  vcap_application = JSON.parse(process.env.VCAP_APPLICATION)
  console.log(vcap_application)
}

var config = {
  local: {
    appname: 'chat',
    mode: 'local',
    port: process.env.VCAP_APP_PORT || 3006,
    protocol: 'http',
    uri: 'http://localhost:3006',
    token_secret: 'useraccountservice',
    uas: {
      host: 'uas.apps.yookosapps.com',
      path: '/v1',
      //port: 3000,
      uri: 'http://localhost:3000/'
    },
    redis: {
      host: '127.0.0.1',
      port: 6379,
      password: null,
      testhost: '192.168.10.98',
      cluster: []
    },
  },
  dev: {
    appname: 'chat',
    mode: 'dev',
    port: process.env.VCAP_APP_PORT,
    protocol: 'http',
    uri: 'http://localhost:3006',
    token_secret: 'useraccountservice',
    uas: {
      host: 'uas.apps.yookosapps.com',
      path: '/v1',
      //port: 3000,
      uri: 'http://localhost:3000/'
    },
    redis: {
      host: !appEnv.isLocal ? redisups.credentials.host : undefined,
      port: !appEnv.isLocal ? redisups.credentials.port : undefined,
      password: !appEnv.isLocal ? redisups.credentials.password : undefined,
      testhost: '192.168.10.98',
      cluster: [{
        port: 6379,
        host: '192.168.10.98'
        }, {
          port: 6379,
          host: '192.168.10.4'
        }, {
          port: 6379,
          host: '192.168.10.5'
      }]
    }
  },
  beta: {
    appname: appEnv ? appEnv.name : 'chat',
    mode: appEnv ? appEnv.app.space_name : 'beta',
    port: process.env.VCAP_APP_PORT,
    protocol: 'http',
    uri: appEnv ? appEnv.url : 'http://chat.apps.yookosapp.com',
    token_secret: 'useraccountservice',
    uas: {
      host: 'uas.apps.yookosapps.com',
      path: '/v1',
      uri: 'http://localhost:3000/'
    },
    redis: {
      host: !appEnv.isLocal ? redisups.credentials.host : undefined,
      port: !appEnv.isLocal ? redisups.credentials.port : undefined,
      password: !appEnv.isLocal ? redisups.credentials.password : undefined,
      cluster: [{
        port: 6379,
        host: '192.168.10.98'
        }, {
          port: 6379,
          host: '192.168.10.4'
        }, {
          port: 6379,
          host: '192.168.10.5'
      }]
    }
  }
}
module.exports = function(mode) {
  var env = !appEnv.isLocal ? appEnv.app.space_name : 'local'
  return config[mode || env || 'local'] || config.local;
};
module.exports.cfenv = appEnv
