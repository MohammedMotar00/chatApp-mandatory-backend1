const moment = require('moment');

const messageFormat = (username, message) => {
  return {
    username,
    message,
    time: moment().format('h:m a')
  };
};

module.exports = messageFormat;