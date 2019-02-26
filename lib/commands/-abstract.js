const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { Promise } = require('rsvp');
const stringUtil = require('ember-cli-string-utils');

/**
 * Abstract command class. Refer to current implementation of Ember CLI at:
 * https://github.com/ember-cli/ember-cli/blob/master/lib/models/command.js
 *
 * @class Abstract
 * @namespace Command
 * @abstract
 * @protected
 */
module.exports = {
  works: 'insideProject',

  /**
   * Collection of available options. An option should look like:
   *
   * ```
   *   {
   *     type: <T>,
   *     name: String,
   *     default: String,
   *     aliases:[]<String>,
   *     description: String
   *   }
   * ```
   *
   * @property availableOptions
   * @type {Array}
   * @public
   */
  availableOptions: [],

  /**
   * Tries to extend `availableOptions` with globals from config.
   *
   * @method beforeRun
   * @public
   */
  async beforeRun() {
    this._super.apply(this, arguments);

    // try to read global options from `config/crowdin.js`
    let configOptions = {};
    let module = path.join(this.project.root, 'config', 'crowdin');

    try {
      configOptions = require(module);
      if (typeof configOptions === 'function') {
        configOptions = configOptions();
      }
    } catch (e) {
      // do nothing, ignore the config
    }

    // For all options that are specified in config/crowdin.js, set the value there to be the actual default value
    this.availableOptions.map((option) => {
      let normalizedName = stringUtil.camelize(option.name);
      let configOption = configOptions[normalizedName];

      if (configOption !== undefined) {
        option.default = configOption;
        return option;
      }

      return option;
    });

    await this._createTmpFolder(this._getTmpDir());
  },

  /**
   * Run `start()` after setting up the options.
   * Also, time out after 5 minutes (if something goes wrong).
   *
   * @method run
   * @param {Object} options
   * @return {Promise}
   * @public
   */
  async run(options) {
    options.tmpDir = this._getTmpDir();
    options.ui = this.ui;

    let promise = this.start(options);

    try {
      await new Promise((resolve, reject) => {
        promise.then(resolve, reject);

        process.on('SIGINT', function() {
          reject('Command cancelled...');
        });

        // Also just time out after 5 minutes
        setTimeout(
          () => reject('Timeout after 5 minutes - command cancelled!'),
          5 * 60 * 1000
        );
      });
    } catch (error) {
      this._cleanupTmpFolder(this._getTmpDir());
      throw error;
    }

    this._cleanupTmpFolder(this._getTmpDir());
  },

  /**
   * Template method for implementing actual logic after checks.
   * Override this in sub-classes.
   *
   * @public
   * @method start
   * @return {RSVP.Promise}
   */
  start() {
    throw new Error(
      `command must implement start() when not overriding run()!`
    );
  },

  _logError(str) {
    this.ui.writeLine(chalk.red(str));
  },

  _logSuccess(str) {
    this.ui.writeLine(chalk.green(str));
  },

  _logWarn(str) {
    this.ui.writeLine(chalk.yellow(str));
  },

  _log(str) {
    this.ui.writeLine(str);
  },

  _getTmpDir() {
    return path.join(this.project.root, 'tmp', '.crowdin');
  },

  /**
   * Create a tmp folder to put files from/to Zanata into.
   * It is assumed that this is one level deep in the ./tmp folder.
   *
   * @method _createTmpFolder
   * @param {String} tmpDir
   * @protected
   */
  _createTmpFolder(tmpDir) {
    let fullTmpDirPath = path.join(tmpDir);
    fs.ensureDirSync(fullTmpDirPath);
  },

  /**
   * Clean up the tmp folder.
   *
   * @method _cleanupTmpFolder
   * @param {String} tmpDir
   * @protected
   */
  _cleanupTmpFolder(tmpDir) {
    let fullTmpDirPath = path.join(tmpDir);
    fs.removeSync(fullTmpDirPath);
  }
};
