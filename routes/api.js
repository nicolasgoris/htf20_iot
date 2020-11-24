const help = require('./help'),
  config = require('../config/config'),
  express = require('express'),
  router = express.Router(),
  https = require('https');

/**
 * Implement this method
 */

router.get('/api/getmonsters', (req, res) => {
  return (async () => {
    let oneHourAgo = new Date().setHours(new Date().getHours() - 1);
    let measures = JSON.parse(await getAPI(config.measuresUrl + '?filter=timestamp gt ' + oneHourAgo));
    res.send(measures);
  })()
    .catch(error => res.send(error));
})

/**
 * Do not change code after this line if you do not know what you are doing =)
 */

const getAPI = (url) => new Promise((resolve, reject) => {
  return https
    .get(url, (response) => {
      if (response.statusCode === 301) {
        resolve(getAPI(config.baseUrl + response.headers.location));
      } else {
        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        })
        response.on('end', () => {
          resolve(body)
        })
      }
    })
    .on('error', (e) => reject(e));
});

router.get('/', (req, res, next) => {
  res.redirect('/api');
});

router.post('/api/initiatemonsters', (req, res) => {
  if (help._validateInit(req.body)) {
    help._createMonsters(req.body);
    res.json({ status: 'ok' });
  } else {
    res.status(400).send('Missing parameters');
  }
});

router.post('/api/movemonsters', (req, res) => {
  return (async () => {
    help._moveMonsters(req.body);
    res.json({ status: 'ok' });
  })()
    .catch(error => res.send(error));
});

module.exports = router;