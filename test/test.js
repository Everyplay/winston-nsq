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
  var config = {
    topic: topic,
    nsqlookupd: [lookupHost],
    handleExceptions: true
  };
  winston.add(winston.transports.Nsq, config);
  winston.default.transports.Nsq._producer.once('ready', function() {
    done();
  });
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
    var messages = [];
    it('should insert message without meta', function (done) {
      messages.push('Message w/o meta');
      winston.log('info', 'Message w/o meta', function (err, data) {
        done(err, data);
      });
    });

    it('should insert message with meta', function (done) {
      messages.push('Message w/ meta');
      winston.log('info', 'Message w/ meta', { val: 1 }, function (err, data) {
        done(err, data)
      });
    });

    it('should insert warning message', function (done) {
      messages.push('Warning message');
      winston.log('warn', 'Warning message', function (err, data) {
        done(err, data)
      });
    });

    it('NSQD should have the mssages', function(done) {
      var consumer = nsq.reader({
        topic: topic,
        channel: '_test_channel',
        nsqlookupd: [lookupHost]
      });
      var i = 0;
      function next() {
        i++;
        if (i == messages.length) {
          done();
        }
      }
      consumer.on('message', function(msg) {
        var b = JSON.parse(msg.body.toString('utf-8'));
        msg.finish();
        if(messages.indexOf(b.message) !== -1) {
          next();
        }
      });
    });
  });
});