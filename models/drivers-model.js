const mongoose = require('mongoose');

const driversSchema = mongoose.Schema({
  userCode: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  phone: {
    type: String
  },
  matricule: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  location: {
    type: Object,
    properties: {
      type: {
        type: String,
        enum: 'Point',
        default: 'Point'
      },
      coordinates: {
        //  type: [Number],
        type: Object,
        default: {
          lat: 0,
          long: 0
        }
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }

});

driversSchema.index({
  'location': "2dsphere"
})

module.exports = mongoose.model('drivers', driversSchema);