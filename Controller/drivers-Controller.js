const Drivers = require('../models/drivers-model');
const Bookings = require('../models/booking-model');
const Unavailable = require('../models/unavailable_model');


/******************* add new coordinate */

exports.add = function (req, res) {

  const user = new Drivers({
    userCode: req.body.userCode,
    taximeterCode: req.body.taximeterCode,
    status: req.body.status,
    location: req.body.location,
    name:req.body.name,
    phone:req.body.phone,
    matricule:req.body.matricule

  });
  user.save()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json({
        message: err
      });

    });

};


/******************** Filtre per userCode,status,between_day,day */

exports.Filtre_Coordinates = async (req, res) => {

  if (req.query.userCode != undefined) {
    try {

      const users = await Drivers.find({
        "userCode": req.query.userCode
      }, {
        status: 1,
        location: 1
      });
      
      if (users.length) {
        var tab = new Array();
        let formatted_polygons = users.map(users => ({
          coordinates: users.location.coordinates,
          status: users.status
        }))

        if (req.query.status == 'true') {
          for (let i = 0; i < formatted_polygons.length; i++) {
            tab.push(formatted_polygons[i]['coordinates'])
            tab.push(formatted_polygons[i]['status'])
          }
        } else if (req.query.status == 'false') {
          for (let i = 0; i < formatted_polygons.length; i++) {
            tab.push(formatted_polygons[i]['coordinates'])
          }
        }
        const Geojson_user = {
          "location": {
            "type": "Point",
            "coordinates": tab
          }
        }
        res.json(Geojson_user);

      } else {
        res.send("ce userCode n'existe pas ! Merci de le vérifier !")
      }
    } catch (err) {
      res.json({
        message: err
      });
    }


  } else if (req.query.status != undefined) {

    try {
      const users = await Drivers.find({
        "status": req.query.status
      }, {
        userCode: 1,
        taximeterCode: 1,
        location: 1
      });
      if (users.length) {
        var tab_busy = new Array();
        var tab_free = new Array();
        let formatted_polygons = users.map(users => ({
          coordinates: users.location.coordinates,
          status: users.status,
          taximeterCode: users.taximeterCode,
          userCode: users.userCode
        }))

        for (let i = 0; i < formatted_polygons.length; i++) {
          if (req.query.status == 'busy') {
            tab_busy.push(formatted_polygons[i]['coordinates'])
          } else if (req.query.status == 'Free') {
            tab_free.push(formatted_polygons[i]['coordinates'])
          }
        }
        const Geojson_busy = {

          "location": {
            "type": "Point",
            "coordinates": tab_busy
          }
        }
        const Geojson_free = {

          "location": {
            "type": "Point",
            "coordinates": tab_free
          }
        }

        if (req.query.status == 'busy') {
          res.json(Geojson_busy);
        } else if (req.query.status == 'Free') {
          res.json(Geojson_free)
        }

      } else {
        res.send("ce Status n'existe pas ! Merci de le vérifier !")
      }

    } catch (err) {
      res.json({
        message: err
      });
    }
  } else if (req.query.createdAt != undefined) {
    try {
      // var d = new Date(req.query.createdAt);
      // var format =d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();

      const users = await Drivers.find({
        "createdAt": req.query.createdAt
      }, {
        userCode: 1,
        status: 1,
        location: 1,
        createdAt: 1
      });
      if (users.length > 0) {
        res.json(users);
      } else {
        res.send("cette date n'existe pas ! Merci de la vérifier !")
      }
    } catch (err) {
      res.json({
        message: err
      });
    }
  } else if (req.query.createdAt != undefined && req.query.createdAt != undefined) {

    try {
      var fromDate_query = req.query.createdAt;
      var toDate_query = req.query.createdAt;

      const data = await Drivers.find({
        createdAt: {
          $gte: (fromDate_query[0]),
          $lt: (toDate_query[1])
        }
      })
      let formatted_polygons = data.map(users => ({
        coordinates: users.location.coordinates,
        status: users.status,
        taximeterCode: users.taximeterCode,
        userCode: users.userCode
      }))

      var tab_users = new Array();
      for (let i = 0; i < formatted_polygons.length; i++) {

      }



      var tab_day = {};

      for (let i = 0; i < formatted_polygons.length; i++) {
        for (let j = 0; j < tab_users.length; j++) {


          tab_day[tab_users[i]] = formatted_polygons[i]['coordinates']


        }
      }

      const Geojson_day = {
        "location": {
          "type": "Point",
          "coordinates": tab_day
        }
      }
      res.json(Geojson_day)
    } catch (err) {
      res.json({
        message: err
      });
    }


  }
};

reserv_code = Math.floor((1 + Math.random()) * 0x10000000).toString(16).substring(1);


exports.getCODE = function getCODE() {
  return reserv_code;
}

/**   Reservation of close taxis*/
exports.close_taxis = async function close_taxis(_coordinates, _client, _start, _end, rayon) {
  const close_drivers = await Drivers.find({
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: _coordinates
        },
        $maxDistance: /*100000*/ rayon
      }

    } /*,createdAt:new Date().getTime() - 2*60000*/ ,
    status: "Free"
  }, {
    location: 1,
    _id: 0,
    name: 1,
    phone: 1,
    matricule: 1,
    status: 1,
    userCode: 1
  }).limit(1)
  
  if (close_drivers.length == 0) {
    return "undefined"
  } else {
    const neardriver = new Bookings({
      reservation_code: reserv_code,
      client: {
        id: _client[0],
        nom: _client[1],
        prenom: _client[2],
        email: _client[3],
        phone: _client[4]
      },
      start: {
        place_name: _start[0],
        coordinates: {
          lat: _start[1],
          long: _start[2]
        }
      },
      end: {
        place_name: _end[0],
        coordinates: {
          lat: _end[1],
          long: _end[2]
        }
      },
      driverId: close_drivers[0]['userCode'],
      driver_status: close_drivers[0]['status'],
      location: close_drivers[0]['location']

    });
    neardriver.save();
    var ID = await close_drivers[0]['userCode'];

    const unavailable_driver = new Unavailable({
      code: reserv_code,
      DriverID: close_drivers[0]['userCode']
    });
    unavailable_driver.save();

    return [reserv_code, ID, close_drivers];
  }
};

/** another taxi in case "refuse" or "ignore" */
exports.another_taxis = async function another_taxis(_coordinates, _client, _start, _end, rayon) {
  list = []
  list = await Unavailable.find({
    //  code: reserv_code
    date_response: {
      $gte: new Date().getTime() - 60000 * 1.5
    }

  }, {
    code: 0,
    _id: 0,
    date_response: 0,
    __v: 0
  });

  taxis_noun = []
  for (m = 0; m < list.length; m++) {
    taxis_noun.push(list[m]['DriverID'])
  }

  const close = await Drivers.find({
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: _coordinates
        },
        $maxDistance: rayon
      }
    },
    userCode: {
      $nin: taxis_noun
    },
    status: "Free"
  }, {
    location: 1,
    status: 1,
    _id: 0,
    name: 1,
    phone: 1,
    matricule: 1,
    userCode: 1
  })

  if (close.length == 0) {
    return "undefined"
  } else {
    reserv_code = Math.floor((1 + Math.random()) * 0x10000000).toString(16).substring(1);

    const neardriver = new Bookings({
      reservation_code: reserv_code,
      client: _client,
      start: _start,
      end: _end,
      driverId: close[0]['userCode'],
      driver_status: close[0]['status'],
      location: close[0]['location']

    });
    neardriver.save();
    var ID = await close[0]['userCode'];

    const unavailable_driver = new Unavailable({
      code: reserv_code,
      DriverID: close[0]['userCode']
    });
    unavailable_driver.save();

    return [reserv_code,ID, close];

  }
};