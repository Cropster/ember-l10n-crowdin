const { expect } = require('chai');
const fs = require('fs-extra');
const path = require('path');
const nock = require('nock');
const {
  exportFiles,
  downloadTranslations,
  moveTranslations
} = require('./../../../lib/utils/pull');

function getOptions() {
  let uiLog = [];
  return {
    tmpDir: './tmp/.node-tests',
    apiBaseUrl: 'https://test.com',
    apiKey: 'test-key',
    project: 'test-project',
    crowdinFolderName: 'messages',
    translationsDir: './tmp/.node-tests/translations',
    _uiLog: uiLog,
    ui: {
      writeLine(str) {
        uiLog.push(str);
      },
      startProgress(str) {
        uiLog.push(`startProgress: ${str}`);
      },
      stopProgress() {
        uiLog.push('stopProgress');
      }
    }
  };
}

function createTmpFolder() {
  let fullTmpDirPath = path.join('./tmp/.node-tests');
  fs.ensureDirSync(fullTmpDirPath);
}

function cleanupTmpFolder() {
  let fullTmpDirPath = path.join('./tmp/.node-tests');
  fs.removeSync(fullTmpDirPath);
}

describe('unit > utils > pull', function() {
  describe('exportFiles', function() {
    it('works for status=none', async function() {
      let options = getOptions();

      nock('https://test.com')
        .get('/project/test-project/export?json&async=1&key=test-key')
        .reply(200, {
          status: 'none'
        });

      let mockNode = nock('https://test.com')
        .get('/project/test-project/export-status?json&key=test-key')
        .reply(200, {
          status: 'none'
        });

      let promise = exportFiles(options);
      await new Promise((resolve) => setTimeout(resolve, 400));

      mockNode
        .persist()
        .get('/project/test-project/export-status?json&key=test-key')
        .reply(200, {
          status: 'in-progress'
        });

      await new Promise((resolve) => setTimeout(resolve, 600));

      mockNode
        .persist(false)
        .get('/project/test-project/export-status?json&key=test-key')
        .reply(200, {
          status: 'finished'
        });

      await promise;

      expect(options._uiLog).to.deep.equal([
        'Preparing first export, this can take a few minutes...',
        'startProgress: Exporting translation files...',
        'startProgress: Exporting translation files...',
        'startProgress: Exporting translation files...',
        'stopProgress'
      ]);
    });

    it('works for status=in-progress', async function() {
      let options = getOptions();

      nock('https://test.com')
        .get('/project/test-project/export?json&async=1&key=test-key')
        .reply(200, {
          status: 'none'
        });

      let mockNode = nock('https://test.com')
        .persist()
        .get('/project/test-project/export-status?json&key=test-key')
        .reply(200, {
          status: 'in-progress'
        });

      let promise = exportFiles(options);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      mockNode
        .persist(false)
        .get('/project/test-project/export-status?json&key=test-key')
        .reply(200, {
          status: 'finished'
        });

      await promise;

      expect(options._uiLog).to.deep.equal([
        'startProgress: Exporting translation files...',
        'startProgress: Exporting translation files...',
        'startProgress: Exporting translation files...',
        'stopProgress'
      ]);
    });

    it('works for error during polling', async function() {
      let options = getOptions();

      nock('https://test.com')
        .get('/project/test-project/export?json&async=1&key=test-key')
        .reply(200, {
          status: 'none'
        });

      nock('https://test.com')
        .persist()
        .get('/project/test-project/export-status?json&key=test-key')
        .reply(400, {
          error: {
            message: 'test error'
          }
        });

      try {
        await exportFiles(options);
      } catch (error) {
        expect(error.toString()).to.equal(
          'Error: An error occurred when trying to poll the export status: test error'
        );
        return;
      }

      throw new Error('exportFiles should error');
    });
  });

  describe('downloadTranslations', function() {
    it('works', async function() {
      let options = getOptions();

      nock('https://test.com')
        .get('/project/test-project/download/all.zip?key=test-key')
        .replyWithFile(200, path.join('./node-tests/fixtures/all-basic.zip'));

      createTmpFolder();

      let files = await downloadTranslations(options);

      let deFile = fs.readFileSync(
        path.join(options.tmpDir, 'zip-extracted/messages/de.po'),
        'utf-8'
      );
      let esFile = fs.readFileSync(
        path.join(options.tmpDir, 'zip-extracted/messages/es_ES.po'),
        'utf-8'
      );

      expect(deFile.trim()).to.equal('# EXAMPLE FILE de.po');
      expect(esFile.trim()).to.equal('# EXAMPLE FILE es_ES.po');
      expect(files).to.deep.equal([
        path.join(options.tmpDir, 'zip-extracted', 'messages', 'de.po'),
        path.join(options.tmpDir, 'zip-extracted', 'messages', 'es_ES.po')
      ]);

      cleanupTmpFolder();
    });
  });

  describe('moveTranslations', function() {
    it('works without files', async function() {
      createTmpFolder();

      let options = getOptions();
      let allFiles = [];

      let files = await moveTranslations(allFiles, options);

      expect(files).to.deep.equal([]);

      cleanupTmpFolder();
    });

    it('works without locale', async function() {
      createTmpFolder();

      let options = getOptions();
      let allFiles = [
        path.join('./node-tests/fixtures/example-po-files/de.po'),
        path.join('./node-tests/fixtures/example-po-files/es_ES.po')
      ];

      // Create an existing file, which should be overwritten
      let { translationsDir } = options;
      fs.ensureDirSync(translationsDir);
      fs.writeFileSync(
        path.join(translationsDir, 'de.po'),
        '# EXAMPLE OLD: de.po'
      );
      fs.writeFileSync(
        path.join(translationsDir, 'fr.po'),
        '# EXAMPLE OLD: fr.po'
      );

      let files = await moveTranslations(allFiles, options);

      expect(files).to.deep.equal([
        path.join(translationsDir, 'de.po'),
        path.join(translationsDir, 'es_ES.po')
      ]);

      let deFile = fs.readFileSync(
        path.join(translationsDir, 'de.po'),
        'utf-8'
      );
      let esFile = fs.readFileSync(
        path.join(translationsDir, 'es_ES.po'),
        'utf-8'
      );
      let frFile = fs.readFileSync(
        path.join(translationsDir, 'fr.po'),
        'utf-8'
      );

      expect(deFile.trim()).to.equal('# EXAMPLE 2: de.po');
      expect(esFile.trim()).to.equal('# EXAMPLE 2: es_ES.po');
      expect(frFile.trim()).to.equal('# EXAMPLE OLD: fr.po');

      cleanupTmpFolder();
    });
  });
});
