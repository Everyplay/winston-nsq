# winston-nsq

A NSQ transport for [winston](https://github.com/flatiron/winston) logging library.

## Credits

Code is based on [winston-kafka](https://github.com/nokk/winston-kafka)

## Installation
``` bash
  $ npm install winston
  $ npm install winston-nsq
```
[![Build Status](https://secure.travis-ci.org/Everyplay/winston-nsq.png)](http://travis-ci.org/Everyplay/winston-nsq)

## Usage
``` js
  var winston = require('winston');

  // Adds a Nsq transport (it also adds the field `winston.transports.Nsq`)
  winston.add(require('winston-nsq'), options);
```

The nsq transport accepts the following options:

* __level:__ Level of messages that this transport should log (default: `'info'`).
* host:__ Hostname and port to the nsqd server (host:port).
* nsqd:__ Array of host:port pair for nsqd servers
* nsqlookupd: Array of nsqlookud addresses in host:port format
* __topic:__ The topic to submit the messages to.

## License
MIT
