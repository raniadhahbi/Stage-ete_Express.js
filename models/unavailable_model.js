const mongoose = require('mongoose');

const notavailable_Schema = mongoose.Schema({

  code: {
    type: String
  },
  DriverID: {
    type: String
  },
  date_response: {type:Date,
    default: Date.now}

});

module.exports = mongoose.model('unavailable', notavailable_Schema);