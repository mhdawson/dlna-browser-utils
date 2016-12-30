"use strict";

const browseServer = require('./lib/index.js');

var listContent = function(queue, url, filter, err) {
  var root = queue.shift();
  browseServer(function(err, result) {
console.log(result);
console.log(err);
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
 //       if (result.item[i].title.indexOf('Big_Bang_Theory') != -1) {
          console.log('Item:' + result.item[i].title);
 //       }
      }
    }
    if (queue.length >0) {
      listContent(queue, url, err, 'BrowseDirectChildren', filter);
    }
  },
  url,
  root,
  'BrowseDirectChildren',
  filter);
}

var queue = new Array();
queue.push('New(auto)');
listContent(queue,'http://10.1.1.176:49081/dev/b9a87696-f016-4a54-81b3-75f57185a385/svc/upnp-org/ContentDirectory/action', '\\*', function(){});
