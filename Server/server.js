const express = require('express');
const http = require('http');;
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);



// Körs när en klient connects
io.on('connection', socket => {
  
});