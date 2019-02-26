const AbstractCommand = require('./-abstract');
let BaseCommand = Object.create(AbstractCommand);
const { uploadMessagesFile } = require('./../utils/push');
const { checkProjectSetup } = require('./../utils/crowdin-api');

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
  name: 'crowdin:push',
  description: 'Upload your messages.pot file',

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
      name: 'crowdin-file-name',
      type: String,
      aliases: ['file'],
      description: 'The file name on Crowdin.',
      required: true,
      default: 'messages.pot'
    },
    {
      name: 'translations-dir',
      type: String,
      aliases: ['d'],
      description: 'The folder name where the translation files are kept.',
      required: true,
      default: './translations'
    },
    {
      name: 'translations-file',
      type: String,
      aliases: ['mf'],
      description: 'The name of the file containing the translation strings.',
      required: true,
      default: 'messages.pot'
    }
  ],

  async start(options) {
    await checkProjectSetup(options);
    await uploadMessagesFile(options);
  }
});
