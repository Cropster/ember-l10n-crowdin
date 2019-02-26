const path = require('path');
const AbstractCommand = require('./-abstract');
let BaseCommand = Object.create(AbstractCommand);
const { checkProjectSetup } = require('./../utils/crowdin-api');
const {
  moveTranslations,
  exportFiles,
  downloadTranslations
} = require('./../utils/pull');

/**
 * Pull translation data from Zanata.
 * This can pull translation files, source files, or both.
 * Don't forget to specify a version & project to pull from!
 *
 * You'll also need to specify the list of locales to pull.
 * It is recommended to put those (along with the project-id) in the `config/zanata.js` file.
 *
 *  * Push all files: `ember zanata:push`
 *  * Push translation files only: `ember zanata:push --update-type=trans`
 *  * Push source files only: `ember zanata:push --update-type=source`
 *
 * Note that the Zanata API is a bit flaky. Because of this, this will try to push a few times - by default, 4 times.
 * Only if it fails 4 times, will it error out.
 *
 * @class Push
 * @namespace Command
 * @extends Command.Abstract
 * @public
 */
module.exports = Object.assign(BaseCommand, {
  name: 'crowdin:pull',
  description: 'Pull translated files from Crowdin',

  availableOptions: [
    {
      name: 'project',
      type: String,
      aliases: ['U'],
      description: 'The Crowdin project ID',
      required: true
    },
    {
      name: 'api-key',
      type: String,
      aliases: ['key', 'api', 'K'],
      description: 'The API key for the Crowdin project',
      required: true
    },
    {
      name: 'api-base-url',
      type: String,
      aliases: ['url'],
      description: 'The base URL for the Crowdin API',
      required: true,
      default: 'https://api.crowdin.com/api'
    },
    {
      name: 'locale',
      type: Array,
      aliases: ['l'],
      description: 'An array of locales to pull. If not set, pull all'
    },
    {
      name: 'crowdin-folder-name',
      type: String,
      aliases: ['f'],
      description: 'The folder name on Crowdin.',
      required: true,
      default: 'messages'
    },
    {
      name: 'translations-dir',
      type: String,
      aliases: ['d'],
      description: 'The folder name where the translation files are kept.',
      required: true,
      default: './translations'
    }
  ],

  async start(options) {
    await checkProjectSetup(options);

    await exportFiles(options);
    let allFiles = await downloadTranslations(options);
    let updatedFiles = await moveTranslations(allFiles, options);

    this._logSuccess(
      `The following locales have been successfully fetched from Crowdin: ${updatedFiles
        .map((filePath) => path.basename(filePath, '.po'))
        .sort()
        .join(', ')}`
    );
    this._logSuccess(`They have been saved in ${options.translationsDir}`);
  }
});
