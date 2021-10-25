const {
   json
} = require('body-parser');
const express = require('express');
const router = express.Router();

const {
   add,
   Filtre_Coordinates,
   close_taxis
} = require('../Controller/drivers-Controller');

//the routes of API
router.route('/coordinate')
   .post(add);

router.route('/coordinates')
   .get(Filtre_Coordinates);
router.route('/taxi')
   .post(close_taxis);


module.exports = router;