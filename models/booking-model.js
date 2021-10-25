const mongoose = require('mongoose');
const BookingSchema = mongoose.Schema({
  reservation_code: {
    type: String
  },
  client: {
    id: {
      type: String
    },
    nom: {
      type: String
    },
    prenom: {
      type: String
    },
    email: {
      type: String
    },
    phone: {
      type: String
    }
  },
  start: {
    type: Object,
    properties: {
      place_name: {
        type: String
      },
      coordinates: {
        default: {
          lat: 0,
          long: 0
        }
      }
    }
  },
  end: {
    type: Object,
    properties: {
      place_name: {
        type: String
      },
      coordinates: {
        default: {
          lat: 0,
          long: 0
        }
      }
    }

  },
  etat: {
    type: String,
    default: "waiting"
  },

  driverId: {
    type: String
  },
  driver_status: {
    type: String
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
        default: {
          lat: 0,
          long: 0
        }
      }
    }
  },
  date_reservation: {
    type: Date,
    default: Date.now
  },
  response: {
    type: String
  }
});
module.exports = mongoose.model('booking', BookingSchema);