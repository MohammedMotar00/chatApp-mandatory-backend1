const moment = require('moment');

const messageFormat = (username, message) => {
  return {
    username,
    message,
    time: moment().format('LLLL')
  };
};

module.exports = messageFormat;