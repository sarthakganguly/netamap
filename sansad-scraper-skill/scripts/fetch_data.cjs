const https = require('https');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://sansad.in/ls/members',
  'Origin': 'https://sansad.in'
};

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: HEADERS }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    }).on('error', reject);
  });
}

const type = process.argv[2];
const id = process.argv[3];

const ENDPOINTS = {
  list: 'https://sansad.in/api_ls/member?loksabha=18&sitting=1',
  profile: `https://sansad.in/api_ls/member/${id}`,
  parties: 'https://sansad.in/api_ls/member/partyWiseRepresentation?loksabha=18',
  terms: 'https://sansad.in/cms/ls-pp/api/about-parliamentary-terms?locale=en&pagination[limit]=1000'
};

if (!ENDPOINTS[type]) {
  console.error('Usage: node fetch_data.cjs <list|profile|parties|terms> [id]');
  process.exit(1);
}

fetchData(ENDPOINTS[type])
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err.message));
