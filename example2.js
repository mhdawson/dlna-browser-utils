"use strict";
const url = require('url');
const http = require('http');
const xmltojs = require('xml2js');
const browseServer = require('./lib/index.js');
const nodessdp = require('node-ssdp').Client;
const node_ssdp_client = new nodessdp();

const mediaServerName = process.argv[2];

var done = false;
node_ssdp_client.on('response', function (headers, statusCode, rinfo) {
  const requestUrl = url.parse(headers.LOCATION);

  const httpOptions =  {
    host: requestUrl.hostname,
    port: requestUrl.port,
    path: requestUrl.pathname
  }

  const req = http.request(httpOptions, function(response) {
    var data = ''
    response.on('data', function(newData) {
      data = data + newData;
    });

    response.on('end', function() {
      if (done == true) {
        return;
      }
      xmltojs.parseString(data, function(err, result) {
        if(result.root.device[0].friendlyName.toString() === mediaServerName) {
          done = true;
          if (result.root.device[0].serviceList[0].service[0].serviceType[0] ===
            'urn:schemas-upnp-org:service:ContentDirectory:1') {
              const controlUrl =
                'http://' +
                requestUrl.hostname +
                ':' +
                requestUrl.port +
                result.root.device[0].serviceList[0].service[0].controlURL[0];

              browseServer('0', controlUrl, {}, function(err, result) {
                if (err) {
                  console.log(err);
                  return;
                }

                if (result.container) {
                  for (let i = 0; i < result.container.length; i++) {
                    console.log('Container:' + result.container[i].id);
                  }
                }

                if (result.item) {
                  for (let i = 0; i < result.item.length; i++) {
                    console.log('Item:' + result.item[i].title);
                  }
                }
              });
            };
          };
        });
      });
    });
    req.on('error', function(err) {
      console.log(err);
    });
    req.end();
  });

  // search for media server and display top level content
  node_ssdp_client.search('urn:schemas-upnp-org:device:MediaServer:1');
  setTimeout(function() {
    console.log('done');
  }, 10000);
