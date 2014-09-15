var assert = require('assert');

//Node.js driver client class
var nsq = require('nsq.js');
var winston = require('winston');
var async = require('async');

//Transport class
var Nsq = require('../index.js');

var client;
var producer;
var consumer;
var topic = '_exist_topic_test';
var lookupHost = process.env.NSQLOOKUPD || 'localhost:4161';
var logger;

before(function (done) {
  producer = nsq.writer({
    nsqlookupd: [lookupHost]
  })
  producer.on('ready', function () {
    done();
  });
});

before(function (done) {
  var config = {
    topic: topic,
    nsqlookupd: [lookupHost],
    handleExceptions: true
  };
  winston.add(winston.transports.Nsq, config);
  logger = new (winston.Logger)({ exitOnError: false });
  done();
})

describe('Nsq transport', function () {

  describe('construtor', function () {
    it('should fail if host, nsqd or nsqdlookupd is missing', function () {
      assert.throws(function () {
        new Nsq({ topic: topic });
      });
    });

    it('should fail if topic is missing', function () {
      assert.throws(function () {
        new Nsq({ nsqglookupd: [lookupHost] });
      });
    });
  });

  describe('test nsq transport', function () {

    it('should insert message without meta', function (done) {
      logger.log('info', 'Message w/o meta', function (err, data) {
        done(err, data);
      });
    });

    it('should insert message with meta', function (done) {
      logger.log('info', 'Message w/ meta', { val: 1 }, function (err, data) {
        done(err, data)
      });
    });

    it('should insert warning message', function (done) {
      logger.log('warn', 'Warning message', function (err, data) {
        done(err, data)
      });
    });
  });
});