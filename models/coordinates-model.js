const mongoose = require('mongoose');
const CoordinateSchema = mongoose.Schema({
    code_reservation: {
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
                type: [Number],
                default: {
                    lat: 0,
                    long: 0
                }
            }
        }
    }

});
module.exports = mongoose.model('coordinates', CoordinateSchema);