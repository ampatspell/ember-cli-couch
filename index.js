/* eslint-env node */
'use strict';

module.exports = {
  name: 'couch',
  isDevelopingAddon() {
    return true;
  },
  treeForVendor: function() {
    return treeForBlobUtil();
  },
  included: function(app) {
    app.import('vendor/blob-util.js');
  },
};

var path = require('path');
var Template = require('broccoli-templater');
var stew = require('broccoli-stew');
var rename = stew.rename;
var find = stew.find;

function treeForBlobUtil() {
  var blobUtilPath = cleanup(require.resolve('blob-util'));
  var expandedBlobUtilPath = expand(blobUtilPath);
  var blobUtil = normalizeFileName(find(expandedBlobUtilPath));
  return new Template(blobUtil, blobUtilPath, function(content) {
    return {
      moduleBody: content
    };
  });
}

function cleanup(input) {
  return input.replace('lib/index.js', 'dist/blob-util.js');
}

function normalizeFileName(tree) {
  return rename(tree, function() {
    return 'blob-util.js';
  });
}

function expand(input) {
  var dirname = path.dirname(input);
  var file = path.basename(input);
  return dirname + '/{' + file + '}';
}
