'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Page = require('../models/page');

const pages = module.context.collection('pages');
const keySchema = joi.string().required()
.description('The key of the page');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.get(function (req, res) {
  res.send(pages.all());
}, 'list')
.response([Page], 'A list of pages.')
.summary('List all pages')
.description(dd`
  Retrieves a list of all pages.
`);


router.post(function (req, res) {
  const page = req.body;
  let meta;
  try {
    meta = pages.save(page);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(page, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: page._key})
  ));
  res.send(page);
}, 'create')
.body(Page, 'The page to create.')
.response(201, Page, 'The created page.')
.error(HTTP_CONFLICT, 'The page already exists.')
.summary('Create a new page')
.description(dd`
  Creates a new page from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let page
  try {
    page = pages.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(page);
}, 'detail')
.pathParam('key', keySchema)
.response(Page, 'The page.')
.summary('Fetch a page')
.description(dd`
  Retrieves a page by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const page = req.body;
  let meta;
  try {
    meta = pages.replace(key, page);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(page, meta);
  res.send(page);
}, 'replace')
.pathParam('key', keySchema)
.body(Page, 'The data to replace the page with.')
.response(Page, 'The new page.')
.summary('Replace a page')
.description(dd`
  Replaces an existing page with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let page;
  try {
    pages.update(key, patchData);
    page = pages.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(page);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the page with.'))
.response(Page, 'The updated page.')
.summary('Update a page')
.description(dd`
  Patches a page with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    pages.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a page')
.description(dd`
  Deletes a page from the database.
`);
