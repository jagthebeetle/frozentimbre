const https = require('https');

const clientInfo = require('./secret.json');

const GRANT_TYPE = 'grant_type=client_credentials';
const AUTH_OPTIONS = {
  hostname: 'accounts.spotify.com',
  port: 443,
  path: '/api/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': GRANT_TYPE.length,
    'Authorization': prepareAuthorization(clientInfo),
  },
};

const ANALYSIS_OPTIONS = {
  hostname: 'api.spotify.com',
  port: 443,
  method: 'GET',
};

/**
 * Requests analysis for the provided Spotify trackId. Requires a token.
 * @param {string} trackId
 * @param {string} token
 */
function getAnalysis(trackId, token) {
  const path = `/v1/audio-analysis/${trackId}`;
  ANALYSIS_OPTIONS.path = path;
  ANALYSIS_OPTIONS.headers = {
    'Authorization': `Bearer ${token}`,
  };
  return makeRequest(ANALYSIS_OPTIONS).then(d => d.toString());
}

/**
 * @return {Promise<string>}
 */
function getToken() {
  return makeRequest(AUTH_OPTIONS, GRANT_TYPE).then(d => {
    const rawJson = d.toString();
    return JSON.parse(rawJson).access_token;
  });
}

/**
 * @param {*} options
 * @param {*} optData
 * @return {Promise<Buffer>}
 */
function makeRequest(options, optData) {
  const data = [];
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      response.on('data', (d) => {
        data.push(d);
      });

      response.on('end', () => {
        resolve(data.join(''));
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    if (optData) {
      request.write(optData);
    }
    request.end();
  });
}

function encodeBase64(str) {
  return Buffer.from(str).toString('base64');
}

function prepareAuthorization({id, secret}) {
  const clientInfo = encodeBase64(`${id}:${secret}`);
  return `Basic ${clientInfo}`;
}

exports.getToken = getToken;
exports.getAnalysis = getAnalysis;
