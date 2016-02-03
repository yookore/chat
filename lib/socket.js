// Messaging using Rabbit.js
var amqp = require('rabbit.js').createContext('amqp://test:Wordpass15@192.168.10.29:5672')
exports.amqp = amqp
