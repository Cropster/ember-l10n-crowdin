'use strict';

module.exports = {
  name: require('./package').name,

  includedCommands: function() {
    return {
      'crowdin:push': require('./lib/commands/push'),
      'crowdin:pull': require('./lib/commands/pull')
    };
  }
};
