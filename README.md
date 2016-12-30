# dlna-browser-utils

Small utility to be able to browse the content on
a DLNA server.

There were other utilities to discover servers but not
to easily browse the content.

## Installation

To install simply run:

```
npm install dlna-browswer-utils
```

or

```
npm install https://github.com/mhdawson/dlna-browser-utils.git
```

## Usage

The module exports a single function which has the following
signature:

```
browseServer(id, controlUrl, options, callback)
```

where the parameters are as follows:

* id - the id you want to search under.  '0' means start
  from the root.
* controlUrl - the control url for the server. It can be
  discovered by using a utility like
  [node-ssdp](https://www.npmjs.com/package/node-ssdp). see
  the examples for an example of how you can do this.
* options - options for the search as described below.
* callback - callback with 2 parameters, err and result.
  If err is passed then an error occured, otherwise the
  result of the search will be in the result object. The result
  object is as described below.

The options object can optionally conaint the following elements:

* browseFlag - flag passed to server for browsing.  Default is
  'BrowseDirectChildren'.
* filter - filter passed to server for request.  Default is
 '\*' to match all results.
* startIndex - index at which to start returning results. The
  default is 0 to return all results.  If you specify an
  number that number of results will be omitted from the result. This can be used to get a large set of results
  incrementally.
* requestCount - the number of results to return. If there
  are more than this number of results the result will only
  contain the first requestCount results.
* sort - uPnP sort order.  Default is '' for no sort.

The result object has two fields each of which is an array.
These fields are:

* container
* item

The objects in the container array have the following fields:

* parentID - id of the parent for the container.
* id - id of the container.
* childCount - number of children in the container.
* searchable - indicates if the container is searchable.
* title - title of the container.

The objects in the item array have the following fields:

* parentID - id of the parent for the item.
* id - id of the item.
* title - title of the item.
* res - the dlna resource link for the item.
* contentType - the content type for the item.

## Example Usage

The following example shows how to list all of the contents on
ad DLNA server.  It assumes you have already discovered
the control url with a utility like [node-ssdp](https://www.npmjs.com/package/node-ssdp).

As an example you could run it as:

node example.js "http://10.1.1.176:49081/dev/b9a87696-f016-4a54-81b3-75f57185a385/svc/upnp-org/ContentDirectory/action"

by substituting in the control url for your server.

```javascript
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
              {},
              function(err){
                console.log(err);
              });

```

A second example is included in the file ```example2.js```.  You will need
to install [node-ssdp](https://www.npmjs.com/package/node-ssdp) in order to
run this second example.  It shows how you can dynamically look up a
DLNA server by name and then list the top level content with 'dlna-browser-utils'.

As an example you can run it as:

```
node example2.js 'New - Michaels Media Server'
```

substituting in the name of a DLNA server on your network.

## Contributing

Pull requests welcome. Particularly if you have DLNA servers to test
against and find issues.  So far I've only tested against my own
DLNA server which is part of [JavaPvr](https://github.com/mhdawson/JavaPVR).
