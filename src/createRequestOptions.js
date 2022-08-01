const fs = require('fs');
const request = require('postman-request');
const config = require('../config/config');
const _ = require('lodash');

const _configFieldIsValid = (field) => typeof field === 'string' && field.length > 0;

let requestWithDefaults;

const setRequestWithDefaults = (Logger) => {
  const {
    request: { ca, cert, key, passphrase, rejectUnauthorized, proxy }
  } = config;

  const defaults = {
    ...(_configFieldIsValid(ca) && { ca: fs.readFileSync(ca) }),
    ...(_configFieldIsValid(cert) && { cert: fs.readFileSync(cert) }),
    ...(_configFieldIsValid(key) && { key: fs.readFileSync(key) }),
    ...(_configFieldIsValid(passphrase) && { passphrase }),
    ...(_configFieldIsValid(proxy) && { proxy }),
    ...(typeof rejectUnauthorized === 'boolean' && { rejectUnauthorized })
  };

  const _defaultsRequest = request.defaults(defaults);

  requestWithDefaults = (requestOptions) =>
    new Promise((resolve, reject) => {
      _defaultsRequest(requestOptions, (err, res, body) => {
        Logger.trace({ requestOptions }, 'Request Options');
        if (err) return reject(err);
        const response = { ...res, body };

        Logger.trace({ response }, 'Response in requestWithDefaults');

        try {
          checkForStatusError(response, requestOptions, Logger);
        } catch (err) {
          Logger.trace({ err });
          reject(err);
        }
        
        resolve(response);
      });
    });

  Logger.trace({ requestWithDefaults }, 'requests with defaults');
  return requestWithDefaults;
};

const checkForStatusError = (response, requestOptions, Logger) => {
  const statusCode = response.statusCode;
  if (![200, 201, 202, 429, 500, 502, 504].includes(statusCode)) {
    const errorMessage = _.get(response, 'body.errors.0.message', 'Request Error');
    const requestError = new RequestError(errorMessage, statusCode, response.body, {
      ...requestOptions,
      headers: '********'
    });
    throw requestError;
  }
};

class RequestError extends Error {
  constructor (message, status, description, requestOptions) {
    super(message);
    this.name = 'requestError';
    this.status = status;
    this.description = description;
    this.requestOptions = requestOptions;
  }
}

module.exports = {
  setRequestWithDefaults
};
