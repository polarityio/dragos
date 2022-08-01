const _ = require('lodash');
const Bottleneck = require('bottleneck/es5');
const { map } = require('lodash/fp');
const { setRequestWithDefaults } = require('./src/createRequestOptions');

let limiter = null;
let request;

let Logger;

let _setupLimiter = (options) => {
  limiter = new Bottleneck({
    maxConcurrent: Number.parseInt(options.maxConcurrent, 10), // no more than 5 lookups can be running at single time
    highWater: 100, // no more than 100 lookups can be queued up
    strategy: Bottleneck.strategy.OVERFLOW,
    minTime: Number.parseInt(options.minTime, 10) // don't run lookups faster than 1 every 200 ms
  });
};

const startup = (logger) => {
  Logger = logger;
  request = setRequestWithDefaults(Logger);
};

const doLookup = async (entities, options, callback) => {
  if (!limiter) _setupLimiter(options);

  const fetchApiData = limiter.wrap(_fetchApiData);

  try {
    const results = await Promise.all(
      map(async (entity) => {
        const data = await fetchApiData(entity, options);
        return polarityResponse(entity, data);
      }, entities)
    );
    Logger.trace({ lookupResults: results });
    return callback(null, results);
  } catch (error) {
    const err = parseErrorToReadableJSON(error);
    Logger.trace({ err }, 'Err in doLookup');
    return err;
  }
};

const _fetchApiData = async (entity, options) => {
  try {
    const results = await buildResults(entity, options);
    return results;
  } catch (err) {
    let isConnectionReset = _.get(err, 'code', '') === 'ECONNRESET';
    if (isConnectionReset) return retryablePolarityResponse(entity);
    else throw err;
  }
};

const buildRequestOptions = (path, options) => {
  return {
    method: 'GET',
    uri: options.url + path,
    headers: {
      'API-Token': options.apiToken,
      'API-Secret': options.apiKey
    },
    json: true
  };
};

const buildResults = async (entity, options) => {
  let results = [];
  const type = getType(entity, options);

  const indicators =
    type === 'tag'
      ? await indicatorsByTag(entity, options)
      : await getIndicators(entity, type, options);

  for (const indicator of indicators) {
    const productData = await getProductsForIndicator(indicator.value, options);
    const indicatorWithProducts = Object.assign({}, indicator, { productData });
    results.push(indicatorWithProducts);
  }
  return results;
};

const getType = (entity) => {
  let type = '';

  switch (entity.type) {
    case 'domain':
      type = 'domain';
      break;
    case 'ip':
      type = 'ip';
      break;
    case 'hash':
      type = getHashType(entity);
      break;
    case 'custom':
      type = getCustomType(entity);
      break;
    default:
      throw new Error('Unknown type');
  }
  return type;
};

const getCustomType = (entity) => {
  let type = '';
  if (entity.types.indexOf('custom.hostname') >= 0) {
    type = 'hostname';
  }
  if (entity.types.indexOf('custom.filename') >= 0) {
    type = 'filename';
  }
  if (entity.types.indexOf('custom.tag') >= 0) {
    type = 'tag';
  }
  return type;
};

const getHashType = (entity) => {
  if (entity.isMD5) return 'md5';
  if (entity.isSHA1) return 'sha1';
  if (entity.isSHA256) return 'sha256';
};

const indicatorsByTag = async (entity, options) => {
  try {
    const query = `${entity.value}`;
    const uri = `/api/v1/indicators?tags=${query}&page_size=10`;

    const requestOptions = buildRequestOptions(uri, options);
    const response = await request(requestOptions);

    Logger.trace({ INDICATORS: response });
    return response.body.indicators;
  } catch (err) {
    Logger.trace({ err });
    throw err;
  }
};

const getIndicators = async (entity, type, options) => {
  try {
    const query = `value=${entity.value}&type=${type}`;
    const uri = `/api/v1/indicators?${query}`;

    const requestOptions = buildRequestOptions(uri, options);
    const response = await request(requestOptions);

    return response.body.indicators;
  } catch (err) {
    Logger.trace({ err });
    throw err;
  }
};

const getProductsForIndicator = async (indicatorValue, options) => {
  try {
    const query = `indicator=${indicatorValue}`;
    const uri = `/api/v1/products?${query}`;

    const requestOptions = buildRequestOptions(uri, options);
    const response = await request(requestOptions);

    return response.body.products;
  } catch (err) {
    Logger.trace({ err });
    throw err;
  }
};

/**
 * These functions return potential response objects the integration can return to the client
 */
const polarityResponse = (entity, response) => {
  Logger.trace({ RESPONSE: response });
  return {
    entity,
    data:
      response.length > 0
        ? {
            summary: [
              `Indicators: ${response.length}`,
              `Reports: ${response[0].productData.length}`
            ],
            details: response
          }
        : null
  };
};

const retryablePolarityResponse = (entity) => {
  return {
    entity,
    isVolatile: true,
    data: {
      summary: ['Lookup limit reached'],
      details: {
        summaryTag: 'Lookup limit reached',
        errorMessage: ''
      }
    }
  };
};

const onMessage = (payload, options, callback) => {
  switch (payload.action) {
    case 'retryLookup':
      doLookup([payload.entity], options, (err, lookupResults) => {
        if (err) {
          Logger.error({ err }, 'Error retrying lookup');
          callback(err);
        } else {
          callback(
            null,
            lookupResults && lookupResults[0] && lookupResults[0].data === null
              ? { data: { summary: ['No Results Found on Retry'] } }
              : lookupResults[0]
          );
        }
      });
      break;
  }
};

const getSummary = (data) => {
  let tags = [];

  return _.uniq(tags);
};

const parseErrorToReadableJSON = (err) => {
  return err instanceof Error
    ? {
        ...err,
        name: err.name,
        message: err.message,
        stack: err.stack,
        detail: err.message ? err.message : 'Unexpected error encountered'
      }
    : err;
};

function validateOption (errors, options, optionName, errMessage) {
  if (!(typeof options[optionName].value === 'string' && options[optionName].value)) {
    errors.push({
      key: optionName,
      message: errMessage
    });
  }
}

function validateOptions (options, callback) {
  let errors = [];

  validateOption(errors, options, 'url', 'You must provide an api url.');
  validateOption(errors, options, 'apiKey', 'You must provide a valid access key.');

  if (options.maxConcurrent.value < 1) {
    errors = errors.concat({
      key: 'maxConcurrent',
      message: 'Max Concurrent Requests must be 1 or higher'
    });
  }

  if (options.minTime.value < 1) {
    errors = errors.concat({
      key: 'minTime',
      message: 'Minimum Time Between Lookups must be 1 or higher'
    });
  }

  callback(null, errors);
}

module.exports = {
  doLookup,
  startup,
  onMessage,
  validateOptions
};
