const socket = io();

// const activeRoomsTemplate = document.getElementById('active-rooms-template').innerHTML;

socket.on('sendActiveRooms', rooms => {
    console.log(rooms);
    // const html = Mustache.render(activeRoomsTemplate, {
    //     rooms
    // });
    // document.getElementById('active-rooms').innerHTML = html;
    const $activeRoomList = document.getElementById('active-rooms-list');
    $activeRoomList.innerHTML = '';
    rooms.forEach(room => {
        const roomName = document.createTextNode(room);
        const li = document.createElement('li');
        li.style.color = 'white';
        li.style.border = '2px solid white';
        li.appendChild(roomName);
        $activeRoomList.appendChild(li);
    });
});

socket.emit('showActiveRooms');