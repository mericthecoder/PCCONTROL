const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

const PORT = process.env.PORT || 3000;

const VALID_PIN = '1234';
const authenticatedClients = new Set();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('auth', (data) => {
    if (data.pin === VALID_PIN) {
      authenticatedClients.add(socket.id);
      socket.emit('auth_result', { success: true });
      console.log('Client authenticated:', socket.id);
    } else {
      socket.emit('auth_result', { success: false, message: 'Invalid PIN' });
    }
  });

  socket.on('action', (action) => {
    if (!authenticatedClients.has(socket.id)) {
      console.log('Unauthorized action attempt from:', socket.id);
      return;
    }
    console.log('Relaying action:', action);
    socket.broadcast.emit('execute', action);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use(express.static('../client'));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
