// const path = require('path');
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://mohammed:mohammedmotar@chatapp-xyr0p.mongodb.net/chat?retryWrites=true&w=majority', (err) => {
  if (err) console.log(err);
  console.log('Connected to mongoDB')
});

let chatSchema = mongoose.Schema({
  _id: String,
  room: String,
  username: String,
  msg: String,
  msgTime: String
});

let roomSchema = mongoose.Schema({
  _id: String,
  createdRoom: String
});

let CreatedRoom = mongoose.model('createdRoom', roomSchema);

let Chat = mongoose.model('Message', chatSchema);

const router = require('./router');
const formatMessage = require('./messageFormat');
const { userJoin, getSpecificUser, userLeaveChat, getUserRoom } = require('./userInfo');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(router);

const botName = 'chatCord bot';

// Run when a client connects
io.on('connection', socket => {
  // fångar namnet och rummet för min användare som jag har skickat från frontend hit!
  socket.on('joinRoom', ({ name, room }) => {
    const user = userJoin(socket.id, name, room);

    // if (room === undefined) {
    //   room = 'default'
    // }

    console.log(room)
    console.log(user.room)

    Chat.find({room: room}, (err , data) => {
      if (err) throw err;
      console.log('sending old messages...');
      io.to(user.room).emit('oldMsg', data);
    });

    CreatedRoom.find({}, (err, data) => {
      if (err) throw err;
      console.log('sending created rooms');
      socket.broadcast.emit('alreadyCreatedRooms', data);
    });

    socket.join(user.room);

    // Welcome Curent user
    socket.emit('message', formatMessage(botName, 'welcome to chat app!'));

    // Broadcast when user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat!`));

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getUserRoom(user.room)
    });

  // Listen for chat message
  socket.on('chatMessage', (message, room) => {
    const user = getSpecificUser(socket.id);
    console.log(room, message)

    let newMsg = new Chat({
      _id: socket.id,
      room: room,
      username: user.username,
      msg: message
    });

    newMsg.save(err => {
      if (err) console.log(`There is an error: ${err}`);
      // io.to(user.room).emit('message', formatMessage(user.username, message));
      io.to(user.room).emit('message', formatMessage(user.username, message));
    });

    // io.to(user.room).emit('message', formatMessage(user.username, message))
  });
  });

  // Listen for chat message
  // socket.on('chatMessage', (message) => {
  //   const user = getSpecificUser(socket.id);
  //   console.log(message)

  //   io.to(user.room).emit('message', formatMessage(user.username, message))
  // });

  // Listen for rooms from frontEnd
  socket.on('createdRoom', room => {
    console.log(room)
    let newRoom = new CreatedRoom({
      _id: socket.id,
      createdRoom: room
    });

    newRoom.save(err => {
      if (err) console.log(`Can't save created room to DB: ${err}`);
      socket.emit('getRooms', room);
    });
  });

  // delete rooms
  socket.on('deleteRoomDB', (id, room) => {
    console.log(room)
    CreatedRoom.findByIdAndDelete(id, err => {
      if (err) console.log(`Could not delete room: ${err}`);
      console.log('Room deleted Successfully');
    });

    Chat.deleteMany({room: room}, err => {
      if (err) console.log(`Could not delete room: ${err}`);
      console.log('Room and messages deleted Successfully');
    });
  })

  socket.on('deleteRoom', (room) => {
    console.log(room)
    CreatedRoom.deleteMany({createdRoom: room}, err => {
      if (err) console.log(`Could not delete room: ${err}`);
      console.log('Room deleted Successfully');
    });

    Chat.deleteMany({room: room}, err => {
      if (err) console.log(`Could not delete room: ${err}`);
      console.log('Room and messages deleted Successfully');
    });
  })

  socket.on('userLeftRoom', data => {
    const user = userLeaveChat(socket.id);

    io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat!`))
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeaveChat(socket.id);

    if (user) {
      // io.emit() gör så att alla får meddelandet, jag vill göra så för att nnär jag disconnectar så vill jag att alla ska veta det!
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat!`))

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getUserRoom(user.room)
      });
    }

  });
});


const PORT = 8000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});