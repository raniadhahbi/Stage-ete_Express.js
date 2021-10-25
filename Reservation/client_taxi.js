
exports.sentPosition = function sentPosition(socket) {
    console.log(socket[id])
   // if (socket = 'specific[0]'){ console.log('we need to save it ')}
    socket.emit('taxi-position', {
        location: {
            type: 'Point',
            coordinates: [getRandomInRange(180, -180, 14), getRandomInRange(90, -90, 14)]
        }

    }
   
    );


}

function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}