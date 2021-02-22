const path = require('path');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom, addRoom, getRooms, removeRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

io.on('connection', socket => {
    socket.on('showActiveRooms', () => {
        const activeRooms = getRooms();

        socket.emit('sendActiveRooms', activeRooms);
    })

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        // check if this room is new
        const answer = addRoom(io, user.room);
        // if it's new add it to the list of active rooms
        if (answer === user.room) {
            io.emit('sendActiveRooms', getRooms());
        }
        socket.emit('message', generateMessage('System', `Welcome ${user.username}!`));
        socket.broadcast.to(user.room).emit('message', generateMessage('System', `${user.username} has joined`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }

        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback('Delivered');
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.rs/maps/?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage('System', `${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });

            if (!io.sockets.adapter.rooms.get(user.room)) {
                removeRoom(user.room);
                io.emit('sendActiveRooms', getRooms());
            }
        }
    });
});

server.listen(PORT);