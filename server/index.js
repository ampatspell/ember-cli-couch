/* eslint-env node */
'use strict';

module.exports = function(app) {
  const path = require('path');
  const serveStatic = require('serve-static');
  const coverage = serveStatic(path.join(__dirname, '../coverage'), { 'index': [ 'index.html' ] });
  app.use('/coverage', coverage);
};
