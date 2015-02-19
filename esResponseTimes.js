#! /usr/bin/env node

var program = require('commander');
var _ = require('lodash');
var request = require('request-json');
var client = request.createClient('http://logserver.youpers.com');
var moment = require('moment-timezone');

program
    .version('0.0.1')
    .usage('node index.js <config>')
//    .option('-p, --peppers', 'Add peppers')
//    .option('-P, --pineapple', 'Add pineapple')
    //  .option('-b, --bbq', 'Add bbq sauce')
    //    .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
    .parse(process.argv);

//var dbObjects = require(program.args[0]);
//var locale = program.args[1];
//var objName = program.args[2];

if (program.args[0] && program.args[0] ==='config') {
    console.log(
    "graph_title Youpers HealthCampaign Backend ResponseTime\n"+
    "graph_vlabel milliseconds\n"+
    "graph_scale no\n"+
    "graph_category responsetimes\n"+
    "graph_info Percentiles of responsetimes on healthcampaign backend\n"+
    "graph_order 1p 5p 25p 50p 75p 95p 99p\n"+
    "1p.label 1% below this \n"+
    "5p.label 5% below this\n"+
    "25p.label 25% below this\n"+
    "50p.label 50% below this\n"+
    "75p.label 75% below this\n"+
    "95p.label 95% below this\n"+
    "99p.label 99% below this\n"
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

client.setBasicAuth('youpers', 'loglog');

var url = '/logstash-' + moment().format('YYYY.MM.DD') + '/_search?search_type=count';
client.get(url, {json: myQuery}, function(err, res, body) {
   if (err) {
       console.log(err);
       process.exit(1);
   }

    console.log('1p ' + body.aggregations.responsetimeAvg['1.0']);
    console.log('5p ' + body.aggregations.responsetimeAvg['5.0']);
    console.log('25p ' + body.aggregations.responsetimeAvg['25.0']);
    console.log('50p ' + body.aggregations.responsetimeAvg['50.0']);
    console.log('75p ' + body.aggregations.responsetimeAvg['75.0']);
    console.log('95p ' + body.aggregations.responsetimeAvg['95.0']);
    console.log('99p ' + body.aggregations.responsetimeAvg['99.0']);
});