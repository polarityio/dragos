const nock = require('nock');
const { doLookup, startup } = require('../integration');

const options = {
  url: 'https://portal.dragos.com',
  apiKey: '12313',
  maxConcurrent: 20,
  minTime: 1
};

const url = {
  type: 'ip',
  value: '91.208.138.8',
  isIP: true,
  types: ['IP', 'IPv4'],
  isIPv4: true
};

const Logger = {
  trace: (args, msg) => {
    console.info(msg, args);
  },
  info: (args, msg) => {
    console.info(msg, args);
  },
  error: (args, msg) => {
    console.info(msg, args);
  },
  debug: (args, msg) => {
    console.info(msg, args);
  },
  warn: (args, msg) => {
    console.info(msg, args);
  }
};

beforeAll(() => {
  startup(Logger);
});

[502, 504].forEach((statusCode) => {
  test(`${statusCode} response when calling 'https://portal.dragos.com'  should return a retryable response`, (done) => {
    const params = new URLSearchParams({
      value: '91.208.138.8'
    });

    const scope = nock(`https://portal.dragos.com`)
      .persist()
      .get(/.*/)
      .query(params)
      .reply(statusCode);

    doLookup([url], options, (err, lookupResults) => {
      const details = lookupResults[0].data.details;
      expect(details.errorMessage).toBe(
        'A temporary Dragos API search limit was reached. You can retry your search by pressing the "Retry Search" button.'
      );
      expect(details.summaryTag).toBe('Lookup limit reached');
      done();
    });
  });
});

test('ECONNRESET response when calling `https://portal.dragos.com` should result in a retryable response', (done) => {
  const params = new URLSearchParams({
    value: '91.208.138.8'
  });

  const scope = nock(`https://portal.dragos.com`)
    .persist()
    .get(/.*/)
    .query(params)
    .replyWithError({ code: 'ECONNRESET' });

  doLookup([url], options, (err, lookupResults) => {
    console.info(lookupResults[0].data.details);
    const details = lookupResults[0].data.details;
    expect(details.errorMessage).toBe(
      'A temporary Dragos API search limit was reached. You can retry your search by pressing the "Retry Search" button.'
    );
    expect(details.summaryTag).toBe('Lookup limit reached');
    done();
  });
});
