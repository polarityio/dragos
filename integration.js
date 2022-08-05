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
        return data;
      }, entities)
    );
    return callback(null, results);
  } catch (error) {
    const err = parseErrorToReadableJSON(error);
    Logger.error({ err }, 'Err in doLookup');
    return callback(err);
  }
};

const _fetchApiData = async (entity, options) => {
  try {
    const indicatorsResponse = entity.types.includes('custom.tag')
      ? await getIndicatorsByTag(entity, options)
      : await getIndicators(entity, options);

    const { body } = indicatorsResponse;

    if (indicatorsResponse.statusCode === 200) {
      const indicatorsWithProducts = await addProductDataToIndicator(
        body.indicators,
        options
      );
      return polarityResponse(entity, indicatorsWithProducts);
    }

    return retryablePolarityResponse(entity);
  } catch (err) {
    let isConnectionReset = _.get(err, 'code', '') === 'ECONNRESET';
    if (isConnectionReset) {
      return retryablePolarityResponse(entity);
    }
    throw err;
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

const addProductDataToIndicator = async (indicators, options) => {
  let results = [];

  try {
    for (const indicator of indicators) {
      const data = await getProductsForIndicator(indicator.value, options);
      const productData = _.orderBy(data, 'release_date', 'desc');
      const indicatorWithProducts = Object.assign({}, indicator, { productData });
      results.push(indicatorWithProducts);
    }
    return results;
  } catch (err) {
    throw err;
  }
};

const getIndicatorsByTag = async (entity, options) => {
  try {
    const query = `${entity.value}`;
    const uri = `/api/v1/indicators?tags=${query}&page_size=10`;

    const requestOptions = buildRequestOptions(uri, options);
    const response = await request(requestOptions);

    return response;
  } catch (err) {
    throw err;
  }
};

const getIndicators = async (entity, options) => {
  try {
    const query = `value=${entity.value}`;
    const uri = `/api/v1/indicators?${query}`;

    const requestOptions = buildRequestOptions(uri, options);
    const response = await request(requestOptions);

    return response;
  } catch (err) {
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
    throw err;
  }
};

/**
 * These functions return potential response objects the integration can return to the client
 */
const polarityResponse = (entity, response) => {
  Logger.trace({ RESPONSE: response.length });
  return {
    entity,
    data: _.get(response, 'length')
      ? {
          summary: getSummary(response),
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
        errorMessage:
          'A temporary Dragos API search limit was reached. You can retry your search by pressing the "Retry Search" button.'
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

const getSummary = (response) => {
  let tags = [];

  if (response && response.length > 0) {
    tags.push(`Indicators: ${response.length}`);
  }

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
