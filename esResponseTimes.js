#! /usr/bin/env node

var program = require('commander');
var _ = require('lodash');
var request = require('request-json');
var moment = require('moment-timezone');

program
    .version('0.0.1')
    .usage('node index.js <config>')
//    .option('-p, --peppers', 'Add peppers')
//    .option('-P, --pineapple', 'Add pineapple')
    //  .option('-b, --bbq', 'Add bbq sauce')
    //    .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
    .parse(process.argv);


var username = process.env.ESUSER;
var password = process.env.ESPW;

var host = process.env.ESHOSTURL || 'http://localhost:9200';

var client = request.createClient(host);
if (username) {
    client.setBasicAuth(username, password);
}

var hostname = process.argv[1].split('_')[1];

if (!hostname) {
    hostname = 'prod';
}

//var dbObjects = require(program.args[0]);
//var locale = program.args[1];
//var objName = program.args[2];

if (program.args[0] && program.args[0] ==='config') {
    console.log(
    "graph_title "+ hostname +" Backend ResponseTime\n"+
    "graph_vlabel milliseconds\n"+
    "graph_scale no\n"+
    "graph_category responsetimes\n"+
    "graph_info Percentiles of responsetimes on "+hostname+" backend\n"+
    "50p.label 50% below this\n"+
    "75p.label 75% below this\n"+
    "95p.label 95% below this\n"+
    "99p.label 99% below this\n" +
    "50p.info 50% of all request had a response time lower than this value\n" +
    "75p.info 75% of all request had a response time lower than this value\n" +
    "95p.info 95% of all request had a response time lower than this value\n" +
    "99p.info 99% of all request had a response time lower than this value\n"
    );
    process.exit(0);
}

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
                            "hostname": hostname
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
                            "level": "info"
                        }
                    }, {
                        "term": {
                            "message": "finished"
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

function formatValue(val) {
    if (val === 'NaN') {
        return 0;
    } else if (_.isString(val)) {
        return parseFloat(val);
    } else {
        return val;
    }
}

var url = '/logstash-' + moment().format('YYYY.MM.DD') + '/_search?search_type=count';
client.get(url, {json: myQuery}, function(err, res, body) {
   if (err) {
       console.log(err);
       process.exit(1);
   }

    console.log('50p.value ' + formatValue(body.aggregations.responsetimeAvg.values['50.0']).toFixed(1));
    console.log('75p.value ' + formatValue(body.aggregations.responsetimeAvg.values['75.0']).toFixed(1));
    console.log('95p.value ' + formatValue(body.aggregations.responsetimeAvg.values['95.0']).toFixed(1));
    console.log('99p.value ' + formatValue(body.aggregations.responsetimeAvg.values['99.0']).toFixed(1));
});