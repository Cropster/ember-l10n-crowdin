const { Promise } = require('rsvp');
const path = require('path');
const fs = require('fs-extra');
const fetch = require('node-fetch');
const decompress = require('decompress');
const { getProjectApiPath } = require('./crowdin-api');

async function exportFiles(options) {
  let url = getProjectApiPath('export?json&async=1', options);

  await fetch(url);
  await pollExportStatus(options);
}

async function pollExportStatus(options) {
  let url = getProjectApiPath('export-status?json', options);

  let response = await fetch(url);
  let json = await response.json();

  if (json.status === 'none') {
    options.ui.writeLine(
      'Preparing first export, this can take a few minutes...'
    );
  }

  if (json.status === 'none' || json.status === 'in-progress') {
    options.ui.startProgress('Exporting translation files...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    return pollExportStatus(options);
  }

  if (json.status === 'finished') {
    options.ui.stopProgress();
    return;
  }

  let error = json.error.message || json.message || JSON.stringify(json);

  throw new Error(
    `An error occurred when trying to poll the export status: ${error}`
  );
}

async function downloadTranslations(options) {
  let url = getProjectApiPath('download/all.zip', options);
  let response = await fetch(url);

  let targetFileName = path.join(options.tmpDir, 'download-translations.zip');

  // Save .zip file in tmp directory
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(targetFileName);
    response.body.pipe(fileStream);

    response.body.on('error', (err) => {
      reject(err);
    });

    fileStream.on('finish', function() {
      resolve();
    });
  });

  // Now extract the .zip file
  let targetDirectory = path.join(options.tmpDir, 'zip-extracted');
  let files = await decompress(targetFileName, targetDirectory);

  let exportedFiles = files
    .filter((file) => file.type === 'file')
    .map((file) => file.path)
    .filter((filePath) => filePath.startsWith(options.crowdinFolderName))
    .map((filePath) => path.join(targetDirectory, filePath));

  return exportedFiles;
}

async function moveTranslations(allFiles, options) {
  let { locale } = options;

  let shouldUpdateAllLocales = !locale || !locale.length;

  let localeFiles = shouldUpdateAllLocales
    ? allFiles
    : allFiles.filter((filePath) =>
        locale.includes(path.basename(filePath, '.po'))
      );

  return localeFiles.map((filePath) => {
    let locale = path.basename(filePath, '.po');
    let targetFile = path.join(options.translationsDir, `${locale}.po`);
    fs.copySync(filePath, targetFile);
    return targetFile;
  });
}

module.exports = {
  exportFiles,
  downloadTranslations,
  moveTranslations
};
