const status = require('statuses');
const errors = require('@arangodb').errors;
const httpError = require('http-errors');
const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const HTTP_NOT_FOUND = status('not found');
const _ = require('lodash');

const $H = require('../lib/handlebars.min-latest');
const fs = require('fs');

//const db = require('@arangodb').db;
//const $contents = db._collection('contents');
const $contents = module.context.collection('contents');
const $pages = module.context.collection('pages');

module.exports = function(req, res, next) {
  
  res.view = function(tplFile, data, layoutFile) {
    var layout, page, t;
    
    if(tplFile.indexOf('.html') > -1) {
      t = $H.compile(fs.readFileSync(__ROOT + '/views/' + tplFile, 'utf-8'));
    } else {
      try {
        var pageData = $pages.document(tplFile);
        if(pageData === null) {
          throw new Error('You will need to create a pages document { "_key": "'+tplFile+'", "content": "<HTML>"}');
        } else {
          page = pageData.content;
          t = $H.compile(page);
          if(pageData.data !== null) {
            data = _.merge(data, {$local: pageData.data});
          }
        }
        
      } catch(e) {
        if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
          throw httpError(HTTP_NOT_FOUND, e.message);
        }
        throw e;
      }
    }
    
    
    if(layoutFile === undefined) {
      layout = fs.readFileSync(__ROOT + '/views/layouts/default.html', 'utf-8');
    } else {
      if(layoutFile.indexOf('.html') > -1) {
        layout = fs.readFileSync(__ROOT + '/views/layouts/' + layoutFile, 'utf-8');
      } else {
        try {
          layoutData = $contents.firstExample({type: 'layout', name: layoutFile});
          if(layoutData === null) {
            throw new Error('You will need to create a contents document {"type": "layout", "name": "'+layoutFile+'", "content": "<HTML>"}');
          } else {
            layout = layoutData.content;
          }
          
        } catch (e) {
          if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
            throw httpError(HTTP_NOT_FOUND, e.message);
          }
          throw e;
        }
      }
      
    }
    var globalDataFromFile = {}, globalDataFromDb = {};
    if(fs.exists( __ROOT + '/models/global.json')) {
      globalDataFromFile = require( __ROOT + '/models/global.json');
    }
    
    try {
      globalDataFromDb = $contents.firstExample({type: 'data', name: 'global'});
      globalDataFromDb = globalDataFromDb.data;
    } catch (e) {
    
    }  
      
    var dataOut = _.merge({content: t(data) }, globalDataFromDb, globalDataFromFile);
    var l = $H.compile(layout);
    res.set('content-type', 'text/html');
    res.send(l( dataOut ));
    
  };
  
  next();
}