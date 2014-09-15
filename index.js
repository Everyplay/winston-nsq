var os = require('os');
var util = require('util');
var winston = require('winston');
var nsq = require('nsq.js');


function Nsq (options) {
  this.name = 'Nsq';
  this.level = options.level || 'info';
  this.topic = options.topic;
  var self = this;
  if(!options || (!options.host && !options.nsqd && !options.nsqlookupd)) {
    throw new Error('winston-nsq: host, nsqd or nsqlookupd option must be present');
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

module.exports = winston.transports.Nsq = Nsq;
util.inherits(Nsq, winston.Transport);

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
  if (!producer.ready) return done(new Error('producer not ready'));
  var message = JSON.stringify(data);
  var payload = {
    topic    : topic,
    messages : message
  };
  producer.send([payload], done);
}
