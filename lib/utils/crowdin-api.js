const fetch = require('node-fetch');

function getApiPath(path, options) {
  return `${options.apiBaseUrl}/${path}`;
}

function getProjectApiPath(url, options) {
  let { project, apiKey } = options;

  let pathParts = ['project', project, url];
  let urlString = pathParts.join('/').replace(/\/+/gm, '/'); // replace duplicate slashes with single slashes

  if (urlString.includes('?')) {
    urlString = `${urlString}&key=${apiKey}`;
  } else {
    urlString = `${urlString}?key=${apiKey}`;
  }

  return getApiPath(urlString, options);
}

async function checkProjectSetup(options) {
  let url = getProjectApiPath(`/info?json`, options);
  let response = await fetch(url);
  let json = await response.json();

  if (json.error) {
    let error = json.error.message;
    throw new Error(
      `It seems your project is not correctly setup - please double check the "project" and "apiKey" settings. Error: ${error}`
    );
  }

  return json;
}

module.exports = {
  getApiPath,
  getProjectApiPath,
  checkProjectSetup
};
