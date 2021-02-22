const socket = io();

socket.on('sendActiveRooms', rooms => {
    const $activeRoomList = document.getElementById('active-rooms-list');
    // empty html on every refresh
    $activeRoomList.innerHTML = '';
    // set maxHeight for scrolling info -> add scroller when maxHeight is passed
    $activeRoomList.style.maxHeight = `${document.querySelector('.centered-form__box').clientHeight}px`;
    if (rooms.length > 0) {
        document.getElementById('active-rooms-header').style.display = 'inline';
        // if there is more than 4 active rooms add scroller
        if (rooms.length > 4) {
            document.getElementById('active-rooms-list').style.overflowY = 'scroll';
        }

        rooms.forEach(room => {
            const $button = document.createElement('button');
            $button.innerText = 'join';
            $button.addEventListener('click', () => {
                const username = document.getElementById('username').value;
                document.getElementById('room').value = room;
                document.getElementById('submit').click();
            });
            const roomName = document.createTextNode(room);
            const $li = document.createElement('li');
            $li.style.color = 'white';
            $li.style.border = '2px solid white';
            $li.style.padding = '5px';
            $li.appendChild(roomName);
            $li.appendChild($button);
            $activeRoomList.appendChild($li);
        });
    }
});

socket.emit('showActiveRooms');