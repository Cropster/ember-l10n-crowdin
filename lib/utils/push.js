const path = require('path');
const fs = require('fs-extra');
const fetch = require('node-fetch');
const FormData = require('form-data');
const { getProjectApiPath } = require('./crowdin-api');
const chalk = require('chalk');

async function uploadMessagesFile(options) {
  let file = path.join(options.translationsDir, options.translationsFile);

  let url = getProjectApiPath(
    `update-file?json&update_option=update_as_unapproved`,
    options
  );

  options.ui.startProgress('Uploading source file...');

  let stream = fs.createReadStream(file);

  let form = new FormData();
  form.append(`files[${options.crowdinFileName}]`, stream);

  let response = await fetch(url, { method: 'POST', body: form });

  options.ui.stopProgress();

  if (response.ok) {
    options.ui.writeLine(
      chalk.green(
        `The file ${
          options.translationsFile
        } has successfully been uploaded to Crowdin.`
      )
    );
  } else {
    let json = await response.json();
    let error = json.error.message || JSON.stringify(error);
    throw new Error(
      `An error occurred when trying to upload the source file: ${error}`
    );
  }
}

module.exports = {
  uploadMessagesFile
};
