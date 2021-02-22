const socket = io();

const activeRoomsTemplate = document.getElementById('active-rooms-template').innerHTML;

socket.on('sendActiveRooms', rooms => {
    console.log(rooms);
    const html = Mustache.render(activeRoomsTemplate, {
        rooms
    });
    document.getElementById('active-rooms').innerHTML = html;
});

socket.emit('showActiveRooms');