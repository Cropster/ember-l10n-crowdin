const { expect } = require('chai');
const { checkProjectSetup } = require('./../../../lib/utils/crowdin-api');
const nock = require('nock');

describe('unit > utils > crowdin-api', function() {
  it('checkProjectSetup works', async function() {
    let options = {
      apiBaseUrl: 'https://test.com',
      apiKey: 'test-key',
      project: 'test-project'
    };

    nock('https://test.com')
      .get('/project/test-project/info?json&key=test-key')
      .reply(200, {
        test: 'a'
      });

    let response = await checkProjectSetup(options);
    expect(response).to.deep.equal({ test: 'a' });
  });

  it('checkProjectSetup works with an API error', async function() {
    let options = {
      apiBaseUrl: 'https://test.com',
      apiKey: 'test-key',
      project: 'test-project'
    };

    nock('https://test.com')
      .get('/project/test-project/info?json&key=test-key')
      .reply(400, {
        success: false,
        error: {
          code: 1,
          message: 'Test error'
        }
      });

    try {
      await checkProjectSetup(options);
    } catch (error) {
      expect(error.toString()).to.equal(
        'Error: It seems your project is not correctly setup - please double check the "project" and "apiKey" settings. Error: Test error'
      );
      return;
    }

    throw new Error('checkProjectSetup should error');
  });
});
