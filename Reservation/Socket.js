const {
    close_taxis,
    another_taxis,
    getCODE
} = require('../Controller/drivers-Controller');
const {
    stringify
} = require('querystring');
const Bookings = require('../models/booking-model');
const Coordinates = require('../models/coordinates-model');
const Drivers = require('../models/drivers-model');
const {
    find
} = require('../models/booking-model');
const {
    Pool
} = require('pg');

exports.Reserver_taxi = function Reserver_taxi(wss_name, pool_name) {
    try {
        var id = 0;
        var specific = {};
        thisone = -1;
        code_chauff = '';
        wss_name.on('connection', async (socket, req) => {
            socket.id = id;
            if (req.url == "/client") {
                thisone = id
            }
            id++;
            specific[socket.id] = socket
            socket.send("you're connected !")

            wss_name.clients.forEach(function (client) {
                if (client !== specific[thisone]) {
                    setInterval(function () {
                        sentPosition(client);
                    }, 10 * 1000);
                }
            });

            socket.on('message', async function incoming(message) {
                socket.emit('reservation', message)

            })
            socket.on('reservation', async function (message) {
                if (message != "refuse" && message != "accept" && message != "finish" && message != "arrive") {
                    result = JSON.parse(message);
                    type_msg = Object.values(result.type).join('')
                    switch (type_msg) {
                        case "booking":
                            coord = Object.values(result['coordinates'])


                            client = []
                            client_id = Object.values(result.client)[0]
                            client_nom = Object.values(result.client)[1]
                            client_prenom = Object.values(result.client)[2]
                            client_email = Object.values(result.client)[3]
                            client_phone = Object.values(result.client)[4]
                            client.push(client_id, client_nom, client_prenom, client_email, client_phone)

                            coord_start = []
                            coord_start_place = Object.values(result.start)[0]
                            coord_start_lat = Object.values(result.start)[1].lat
                            coord_start_long = Object.values(result.start)[1].long
                            coord_start.push(coord_start_place, coord_start_lat, coord_start_long)

                            coord_end = []
                            coord_end_place = Object.values(result.end)[0]
                            coord_end_lat = Object.values(result.end)[1].lat
                            coord_end_long = Object.values(result.end)[1].long
                            coord_end.push(coord_end_place, coord_end_lat, coord_end_long)

                            expeditor = await close_taxis(coord, client, coord_start, coord_end, 100000)

                            if (expeditor == 'undefined') {
                                expeditor = await close_taxis(coord, client, coord_start, coord_end, 150000)

                                if (expeditor == 'undefined') {
                                    specific[thisone].send("there is no near taxis right now !")

                                }
                            }

                            code_chauff = expeditor[0]

                            wss_name.clients.forEach(function (client) {
                                if (client !== socket) {
                                    var info = {
                                        "expeditor": expeditor[1],
                                        "taxi_info": expeditor[2][0]
                                    }

                                    client.send(JSON.stringify(info))
                                    client.send(message);
                                }

                            });

                            mytime = setTimeout(() => {
                                ignore();
                            }, 30 * 1000)
                            break;
                        case "recording":

                            resultat = JSON.parse(message);
                            _departure_address = Object.values(resultat['departure_address']).join('')
                            _arrival_address = Object.values(resultat['arrival_address']).join('')
                            _status_id = Object.values(resultat['status_id']).join('')
                            _passengers_number = Object.values(resultat['passengers_number']).join('')

                            client = []
                            client_id = Object.values(result.client)[0]
                            client_nom = Object.values(result.client)[1]
                            client_prenom = Object.values(result.client)[2]
                            client_phone = Object.values(result.client)[4]
                            _traveled_distance = JSON.stringify(resultat['traveled_distance'])



                            _estimated_time = Object.values(resultat['estimated_time']).join('')
                            _reservation_type = Object.values(resultat['reservation_type']).join('')
                            _created_at = Object.values(resultat['created_at']).join('')

                            _category = Object.values(resultat['category']).join('')
                            _label = Object.values(resultat['label']).join('')
                            pool_name.query(
                                `INSERT INTO tx_booking (departure_address,arrival_address,status_id,passengers_number,passenger_firstname,passenger_lastname,passenger_phone,traveled_distance,estimated_time,reservation_type) VALUES('${_departure_address}','${_arrival_address}',${_status_id},${_passengers_number},'${client_nom}','${client_prenom}','${client_phone}','${_traveled_distance}',${_estimated_time},'${_reservation_type}') `,
                                (err, res) => {
                                    console.log(err, res);


                                }
                            );
                            pool_name.query(
                                `INSERT INTO tx_status (code,label,category)
                                 VALUES('${_label}','${_label}','${_category}') `,
                                (err, res) => {
                                    console.log(err, res);

                                }
                            );
                            pool_name.query(
                                `INSERT INTO tx_booking_user (user_id,booking_id,status_id)
                                 SELECT  ${client_id}, tx_booking_user.booking_id,tx_booking_user.status_id 
                                 FROM tx_booking  INNER JOIN tx_booking_user 
                                ON (tx_booking.id=tx_booking_user.booking_id )
                                AND (tx_booking.status_id=tx_booking_user.status_id)`,
                                (err, res) => {
                                    console.log(err, res);
                                    pool_name.end();
                                }
                            );
                            break;


                    }

                }


                if (message === "refuse") {
                    refuse();

                } else if (message === "accept") {

                    accept();


                }
                if (message === "arrive") {

                    clearInterval(sending_coord)
                    var myquery = {
                        reservation_code: code_chauff
                    };
                    var newvalues = {
                        $set: {
                            etat: "arrived"
                        }
                    };
                    Bookings.updateOne(myquery, newvalues, function (err, res) {
                        if (err) throw err;
                    });

                }
                if (message === "finish") {

                    var myquery = {
                        reservation_code: code_chauff
                    };
                    var newvalues = {
                        $set: {
                            etat: "finished"
                        }
                    };
                    Bookings.updateOne(myquery, newvalues, function (err, res) {
                        if (err) throw err;
                    });

                }

            });
            // socket.on('taxist', function (data) {

            //     socket.send(data)

            // });
            num = getCODE();
            /** response functions*/
            async function accept() {
                socket.send("You accepted the booking !")
                clearTimeout(mytime);

                // specific[thisone].send(JSON.stringify(expeditor[2]))
                var myquery = {
                    reservation_code: code_chauff
                };
                var newvalues = {
                    $set: {
                        etat: "accepted"
                    }
                };
                Bookings.updateOne(myquery, newvalues, function (err, res) {
                    if (err) throw err;
                });
                const taxi_client = await Bookings.find({
                    reservation_code: code_chauff,
                    date_reservation: {

                        $gte: new Date().getTime() - 60000
                    }
                });

                const chauffeur = await Drivers.find({
                    userCode: taxi_client[0]['driverId']
                }, {
                    __id: 0,
                    status: 0
                });
                specific[thisone].send(JSON.stringify(chauffeur))
                sending_coord = setInterval(function () {

                    sentPosition(specific[thisone]);
                }, 10 * 1000);

            }

            async function refuse() {
                var myquery = {
                    reservation_code: code_chauff
                };
                // var myquery = {
                //     reservation_code: num
                // };
                var newvalues = {
                    $set: {
                        etat: "refused"
                    }
                };
                Bookings.updateOne(myquery, newvalues, function (err, res) {
                    if (err) throw err;
                });
                socket.send("You refused the reservation !");
                clearTimeout(mytime)
                new_expeditor = await another_taxis(coord, client, coord_start, coord_end, 100000)

                if (new_expeditor == 'undefined') {
                    new_expeditor = await another_taxis(coord, client, coord_start, coord_end, 150000)

                    if (new_expeditor == 'undefined') {
                        specific[thisone].send("there is no near taxis right now !")
                    }
                }
                code_chauff = new_expeditor[0]
                // else {
                wss_name.clients.forEach(function (client) {
                    if (client !== socket) {
                        var info = {
                            "expeditor": new_expeditor[1] //,
                            // "taxi_info": new_expeditor[2][0]
                        }

                        client.send(JSON.stringify(info))
                        client.send(JSON.stringify(result));
                    }
                });
                mytime = setTimeout(() => {
                    ignore();
                }, 30 * 1000)
                //  }
            }

            async function ignore() {
                clearTimeout(mytime)
                var driver = {
                    reservation_code: code_chauff

                };
                // var driver = {
                //     reservation_code: num

                // };
                var newvalues = {
                    $set: {
                        etat: "rejeted"
                    }
                };
                Bookings.updateOne(driver, newvalues, function (err, res) {
                    if (err) throw err;

                });
                

                new_expeditor = await another_taxis(coord, client, coord_start, coord_end, 100000)
                if (new_expeditor == 'undefined') {
                    new_expeditor = await another_taxis(coord, client, coord_start, coord_end, 150000)
                    if (new_expeditor == 'undefined') {
                        specific[thisone].send("there is no near taxis right now !")
                    }
                }
                code_chauff = new_expeditor[0]
                // else {
                wss_name.clients.forEach(function (client) {
                    if (client !== socket) {
                        var info = {
                            "expeditor": new_expeditor[1],
                            "taxi_info": new_expeditor[2][0]
                        }

                        client.send(JSON.stringify(info))
                        client.send(JSON.stringify(result));
                    }
                });
                mytime = setTimeout(() => {
                    ignore();
                }, 30 * 1000)
                // }


            }

            socket.on('taxi-position', (data) => {
                socket.send(JSON.stringify(data.location))
                //console.log(data);
            });




            function sentPosition(socket) {

                taxi_coordinates = {
                    location: {
                        type: 'Point',
                        coordinates: {
                            lat: getRandomInRange(180, -180, 14),
                            long: getRandomInRange(90, -90, 14)
                        }
                    }
                }

                if (socket == specific[thisone]) {
                    socket.emit('taxi-position', taxi_coordinates);
                    const coord = new Coordinates({
                        code_reservation: num,
                        location: taxi_coordinates
                    });
                    coord.save();

                } else {

                    socket.emit('taxi-position', taxi_coordinates);
                }


            }

            function getRandomInRange(from, to, fixed) {
                return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
            }
        })
    } catch (err) {
        console.log(err)
    }
};