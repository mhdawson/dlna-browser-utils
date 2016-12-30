"use strict";

const browseServer = require('./lib/index.js');

var listContent = function(queue, url, options, callback) {
  var root = queue.shift();
  browseServer(
    root,
    url,
    {},
    function(err, result) {
      if (err) {
        callback(err);
        return;
      }
      if (result.container) {
        for (let i = 0; i < result.container.length; i++) {
          if (result.container[i].id != 'Video/temp') {
            queue.push(result.container[i].id);
            console.log('Container:' + result.container[i].id);
          }
        }
      }

      if (result.item) {
        for (let i = 0; i < result.item.length; i++) {
          console.log('Item:' + result.item[i].title);
        }
      }
      if (queue.length >0) {
        listContent(queue, url, options, callback);
      }
    });
  }

  var queue = new Array();
  queue.push('0');
  listContent(queue,
              process.argv[2],
//              'http://10.1.1.176:49081/dev/b9a87696-f016-4a54-81b3-75f57185a385/svc/upnp-org/ContentDirectory/action',
              {},
              function(err){
                console.log(err);
              });
