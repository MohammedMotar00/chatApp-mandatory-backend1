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
  msg: String
});

let Chat = mongoose.model('Message', chatSchema);

const router = require('./router');
const formatMessage = require('./messageFormat');
const { userJoin, getSpecificUser, userLeaveChat, getUserRoom } = require('./userInfo');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set static folder
// app.use(express.static(path.join(__dirname, '../src')));
app.use(router);

const botName = 'chatCord bot';

// Run when a client connects
io.on('connection', socket => {
  // fångar namnet och rummet för min användare som jag har skickat från frontend hit!
  socket.on('joinRoom', ({ name, room }) => {
    const user = userJoin(socket.id, name, room);

    Chat.find({room: user.room}, (err , data) => {
      if (err) throw err;
      console.log('sending old messages...');
      io.to(user.room).emit('oldMsg', data);
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
    socket.on('chatMessage', (message) => {
      const user = getSpecificUser(socket.id);
      console.log(message)

      console.log(user.room)

      let newMsg = new Chat({
        _id: socket.id,
        room: user.room,
        username: user.username,
        msg: message
      });

      newMsg.save(err => {
        if (err) console.log(`There is an error: ${err}`);
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
    socket.emit('getRooms', room);
  });

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