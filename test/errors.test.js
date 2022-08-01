const nock = require('nock');
const { doLookup, startup } = require('../integration');

const options = {
  url: 'https://api.twinwave.io/v1',
  apiKey: '12313',
  maxConcurrent: 20,
  minTime: 1
};

const url = {
  type: 'url',
  value: 'https://orsan.gruporhynous.com',
  isURL: true
};

const response = {
  HasNext: false,
  Jobs: [
    {
      Job: {
        ID: '03a4ecec-3920-40db-a845-3ccaea159f8d',
        TenantID: 'polarity',
        CreatedAt: '2021-10-28T17:56:53.162Z',
        Username: 'joem@polarity.io',
        APIKeyID: '',
        APIKeyLabel: '',
        SubmittedFile: null,
        SubmittedURL: {
          URL: 'https://products.office.com',
          MD5: 'f4b4017ceece313203d788ff1cea8dfd',
          Hostname: 'products.office.com'
        },
        Files: null,
        URLs: [
          {
            URL: 'https://www.microsoft.com/en-us/microsoft-365?rtc=1',
            MD5: '45c4f4e7a554dc6024192322d0c5affe',
            Hostname: 'www.microsoft.com'
          },
          {
            URL: 'https://www.microsoft.com/microsoft-365',
            MD5: '8a0b727cc08ed71af5943dbe46c93e9b',
            Hostname: 'www.microsoft.com'
          },
          {
            URL: 'https://products.office.com',
            MD5: 'f4b4017ceece313203d788ff1cea8dfd',
            Hostname: 'products.office.com'
          }
        ],
        Tasks: [
          {
            ID: '0a9c297a-c469-4077-b3b4-eb2e8126420d',
            EngineName: 'web_analyzer',
            Score: 0
          },
          {
            ID: '3ff59148-e443-464a-9967-b5c4dacfcf81',
            EngineName: 'url_reputation',
            Score: 0
          },
          {
            ID: '470db0ca-9a18-47d3-a79c-3c74c2a1f8d1',
            EngineName: 'url_reputation',
            Score: 0
          },
          {
            ID: '4ac60e82-58a1-4ba9-b53c-14593edddf51',
            EngineName: 'web_analyzer',
            Score: 0
          },
          {
            ID: '8241eaed-747a-4928-949a-46e169e5c1b9',
            EngineName: 'url_reputation',
            Score: 0
          },
          {
            ID: 'e4c8c776-23f9-4d0d-9faa-957b77fd77b4',
            EngineName: 'web_analyzer',
            Score: 0
          }
        ],
        Score: 0,
        Verdict: '',
        Labels: null,
        Shared: false
      },
      Highlights: [
        {
          ResourceType: 'URL',
          HTMLString: '<em>https://products.office.com</em>'
        }
      ]
    }
  ]
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

// [502, 504].forEach((statusCode) => {
//   test(`${statusCode} response when calling 'https://api.twinwave.io/v1'  should return a retryable response`, (done) => {
//     const params = new URLSearchParams({
//       field: 'url',
//       type: 'substring',
//       term: 'https://orsan.gruporhynous.com'
//     });

//     const scope = nock(`https://api.twinwave.io/v1`)
//       .persist()
//       .get(/.*/)
//       .query(params)
//       .reply(statusCode);

//     doLookup([url], options, (err, lookupResults) => {
//       const details = lookupResults[0].data.details;
//       expect(details.errorMessage).toBe(
//         'A temporary TwinWave API search limit was reached. You can retry your search by pressing the Retry Search button.'
//       );
//       expect(details.summaryTag).toBe('Lookup limit reached');
//       done();
//     });
//   });
// });

// test('ECONNRESET response when calling `https://api.twinwave.io/v1` should result in a retryable response', (done) => {
//   const params = new URLSearchParams({
//     field: 'url',
//     type: 'substring',
//     term: 'https://orsan.gruporhynous.com'
//   });

//   const scope = nock(`https://api.twinwave.io/v1`)
//     .persist()
//     .get(/.*/)
//     .query(params)
//     .replyWithError({ code: 'ECONNRESET' });

//   doLookup([url], options, (err, lookupResults) => {
//     console.info(lookupResults[0].data.details);
//     const details = lookupResults[0].data.details;
//     expect(details.errorMessage).toBe(
//       'A temporary TwinWave API search limit was reached. You can retry your search by pressing the Retry Search button.'
//     );
//     expect(details.summaryTag).toBe('Lookup limit reached');
//     done();
//   });
// });

test(`test circular reference`, (done) => {
  const params = new URLSearchParams({
    field: 'url',
    type: 'substring',
    term: 'https://orsan.gruporhynous.com'
  });

  response.Jobs[0].circ = response;

  const scope = nock(`https://api.twinwave.io/v1`)
    .persist()
    .get(/.*/)
    .query(params)
    .reply(200, response);

  doLookup([url], options, (err, lookupResults) => {
    console.info(err);
    // console.info(lookupResults[0].data.details);
    // const details = lookupResults[0].data.details;
    // expect(details.errorMessage).toBe(
    //   'A temporary TwinWave API search limit was reached. You can retry your search by pressing the Retry Search button.'
    // );
    // expect(details.summaryTag).toBe('Lookup limit reached');
    done();
  });
});
// if response is circu