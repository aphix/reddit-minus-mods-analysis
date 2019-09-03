'use strict';

const _ = require('lodash');
const { HttpsAgent } = require('agentkeepalive');
const fetch = require('@zeit/fetch')(require('node-fetch'));

let agent;
let existingCert;
const fetchLikeRequest = async(opts) => {
    if (opts.ca && agent || !_.isEqual(opts.ca, existingCert)) {
        existingCert = opts.ca;
        agent = new HttpsAgent({
            ca: existingCert,
            strictSSL: opts.strictSSL ? opts.strictSSL : undefined,
            keepAliveMsecs: 5000
        });
    }

    const options = _.defaultsDeep({
        body: opts.body ? JSON.stringify(opts.body) : null, // fetch will not automatically stringify, so we're doing it manually here
        compressed: opts.gzip ? opts.gzip : false, // "opts.gzip" is requestPromise's equivalent of "compressed" option for fetch
    }, opts, {
        headers: opts.json ? { 'content-type': 'application/json' } : null, // "opts.json" is requestPromise's equivalent of adding header for fetch
        agent
    });

    const response = (await fetch(opts.url, options));

    const rawBody =  await response.text();
    const body = rawBody.length === 0
        ? undefined // JSON.parse will fail when given empty string (or invalid json), so instead consider the body "undefined"
        : (!!opts.json) || /application\/json/gi.test(response.headers.get('content-type') || '')
            ? JSON.parse(rawBody)
            : rawBody;

    if (!response.ok) {
        const { status, statusText, headers } = response;
        const err = new Error(`${status} - ${JSON.stringify(body)}`); // Matching requestPromise's error format
        err.name = 'StatusCodeError';
        err.status = status;
        err.statusCode = status;
        err.error = body;
        err.headers = headers;
        throw err;
    }

    return body;
};

const _addMethodCallFn = (req, method) => req[method] = (url) => req({url, method});
const _addUnsupportedMethodError = (req, method) => req[method] = () => { throw new Error(`[fetchLikeRequest] Method ${method}() is not supported! Use normal request-promise.`) };

const _addDefaultsAndConvenienceMethods = (req) => {
    req.defaults = (defaults) => _addDefaultsAndConvenienceMethods((opts) => req(_.defaults({}, opts, defaults))); // Ensure that when .defaults is called, the resulting object also has .defaults on it for nested defaulting
    _addMethodCallFn(req, 'get');
    _addMethodCallFn(req, 'post');
    _addMethodCallFn(req, 'put');
    _addMethodCallFn(req, 'patch');
    _addMethodCallFn(req, 'del');
    _addMethodCallFn(req, 'delete');
    _addMethodCallFn(req, 'head');
    _addMethodCallFn(req, 'options');

    _addUnsupportedMethodError(req, 'jar');
    _addUnsupportedMethodError(req, 'cookie');

    return req;
}

_addDefaultsAndConvenienceMethods(fetchLikeRequest);

module.exports = fetchLikeRequest;
