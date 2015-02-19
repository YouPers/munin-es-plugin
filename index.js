var program = require('commander');
var _ = require('lodash');
var request = require('request-json');
var client = request.createClient('http://localhost:9200');
var moment = require('moment-timezone');

program
    .version('0.0.1')
    .usage('')
//    .option('-p, --peppers', 'Add peppers')
//    .option('-P, --pineapple', 'Add pineapple')
    //  .option('-b, --bbq', 'Add bbq sauce')
    //    .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
    .parse(process.argv);

//var dbObjects = require(program.args[0]);
//var locale = program.args[1];
//var objName = program.args[2];

var myQuery = {
    "query": {
        "filtered": {
            "query": {
                "match_all": {}
            },
            "filter": {
                "and": [
                    {
                        "term": {
                            "hostname": "prod"
                        }
                    }, {
                        "term": {
                            "tags": "bunyan"
                        }
                    }, {
                        "range": {
                            "@timestamp": {
                                "gt": "now-5m"
                            }
                        }

                    }, {
                        "term": {
                            "message": "Finished processing request"
                        }
                    }
                ]
            }
        }
    },
    "aggs": {
        "responsetimeAvg": {
            "percentiles": {
                "field": "responsetime"
            }
        }
    }
};

var url = '/logstash-' + moment().format('yy.mm.dd') + '/_search';
client.get(url, {body: myQuery}, function(err, res, body) {
    console.log(JSON.stringify(res));
    console.log(body);

});