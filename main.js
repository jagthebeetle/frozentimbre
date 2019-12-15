const {getToken, getAnalysis} = require('./spotify');

const KEYS = [
  'C',
  'D♭',
  'D',
  'E♭',
  'E',
  'F',
  'G♭',
  'G',
  'A♭',
  'A',
  'B♭',
  'B',
];

function humanizeMode(modality) {
  switch (modality) {
    case 0:
      return 'minor';
    case 1:
      return 'major';
    default:
      return 'unknown key';
  }
}

function summarizeKey(trackOrSection) {
  const {key, key_confidence, mode, mode_confidence} = trackOrSection;
  return `${KEYS[key]} (${key_confidence.toPrecision(2)}) ${
      humanizeMode(mode)} (${mode_confidence.toPrecision(2)})`;
}

const FROZEN = [
  '61HVbcNeRACZpyvHrc3AnD', '4Xbotg4PCLJw9cDx2dtZLK', '3Z0oQ8r78OUaHvGPiDBR3W',
  '1Tt7zr1yDbKbT8L4jzSZ74', '1AHAYbZklQkUj7wgxhQPIo', '7namdlOhbtsc8FvoSafOQt',
  '50WeOnXhM1H7AZEeIDoWfZ', '1gilgPrTkkZTp09Xf8zCmK', '421eObjg0DTm2qajJl5OJm',
  '5EeQQ8BVJTRkp1AIKJILGY', '227zkOoNpqRrzEPxvVRiF5', '4na7Gwn4tqUCxScgHOWAip',
  '6YM4DsQki1UdQSrTGlanVH', '6Rvh5eOFXDPAGAadIfsSLw', '09MvGKcju2jf2ktxDa0s17',
  '401xthyxSHv4raI9NCGgr3', '6se84SHDm1GukrncLMJQMW', '6lPiAmDDn22FQzdIS8UkjY',
  '68Clm85Z6S3BtKndStFne7', '3XZstz9J9v3maTQrt5yZXN', '3t9JBaGfPOEQbNIexSOgDf',
  '7406v86X81FbiBZoPHkHfE', '4FhRrdon3LUV8aSI1NmjlD', '2XG3UzIAv2asT1dK2AIUiK',
  '1yKsZCUrob9CKZKOT7QyDT', '4FPypQoFldRDnjVhtAuL4M', '6ZSRplBb0yT5P8oLL2XblA',
  '3PYgUmM7AzwGG6Qfurk0TP', '2dREuzQ3Ot016q0qeaEYAm', '4zp7CCCk5zMvMHPKcwLqSu',
  '0PmTrHynZvLhAJj7YgeScP', '3BsJnS7Bm5MEa09FUGVt89', '4d9VJR3oZSQ6J3b1DtWKgV',
  '2lkUgZX55tVYY7u02zYH7x', '4fcZbjP3FrEfciejqDFtM0', '5oADQA9bW2mChEEPxSWeXq',
  '4KdrgmXjJ29AsCjE6x1qr3', '4WlrItEJzr0kLzW8jZhoKb', '5UuFnu4GKKP79yL6nsiHMJ',
  '6Li70cXfPXCIxl8tSidUcz', '1iR7tzfJiPtraDTTyIkIvt', '1oD2xFoVBGGil1xYpoSM2c',
  '0oawVjfILybpaSVQL0M6wf', '6XuQJwADFpvgT9i7wPViJd', '5N85k8UJw3SVa20iyZ8muO',
  '3SGUkNKEJLr13RqO6YYsJ8',
];

getToken().then(token => {
  consumeQueue(token);
});

function consumeQueue(token) {
  const next = FROZEN.shift();
  if (!next) {
    return;
  }
  getAnalysis(next, token)
      .then(d => {
        handleResponse(d);
        consumeQueue(token);
      })
      .catch((err) => {
        console.error(err);
        FROZEN.unshift(next);
        setTimeout(() => consumeQueue(token), 500);
      });
}

function humanizeTime(sec) {
  return new Date(sec * 1000).toISOString().substr(11, 8);
}

function handleResponse(d) {
  console.info(d);
}
