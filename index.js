var os = require('os');
var util = require('util');
var winston = require('winston');
var nsq = require('nsq.js');


function Nsq (options) {
  options = options || {};
  options.name = options.name || options.topic || 'Nsq';
  winston.Transport.call(this, options);
  this.topic = options.topic;
  var self = this;
  if(!options || (!options.host && !options.nsqd && !options.nsqlookupd) || !options.topic) {
    throw new Error('winston-nsq: host or nsqd or nsqlookupd and topic option must be present');
  }
  this._producer = nsq.writer({
    host: options.host,
    port: options.port,
    nsqd: options.nsqd,
    nsqlookupd: options.nsqlookupd
  });
  this._producer.on('ready', function() {
    self.producer = self._producer;
    self._queue.forEach(function(q) {
      send(q, self.topic, self.producer, function() {});
    });
    self._queue = [];
  });
  this._queue = [];
}

util.inherits(Nsq, winston.Transport);
module.exports = winston.transports.Nsq = Nsq;


Nsq.prototype.log = function (level, message, meta, done) {
  var data = {
    level     : level,
    message   : message,
    meta      : meta,
    hostname  : os.hostname,
    timestamp : Date.now()
  };
  if(this.producer) {
    send(data, this.topic, this.producer, done);
  } else {
    this._queue.push(data);
  }
};

function send (data, topic, producer, done) {
  var message = JSON.stringify(data);
  producer.publish(topic, message, done);
}
