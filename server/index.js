const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { auth } = require('express-openid-connect');

const app = express();
const server = http.createServer(app);

// Auth0 Configuration (Placeholder - Configure in environment)
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET || 'a-very-long-random-string',
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

// app.use(auth(config)); // Uncomment to enable Auth0 middleware

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

const PORT = process.env.PORT || 3000;

const VALID_PIN = process.env.PIN || '1234';
const authenticatedClients = new Set();
const agents = new Map(); // socket.id -> name

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('identify', (data) => {
    agents.set(socket.id, data.name);
    console.log('Agent identified:', data.name, socket.id);
    // Notify all connected clients of the updated agent list
    io.emit('agent_list', Array.from(agents.entries()));
  });

  socket.on('auth', (data) => {
    if (data.pin === VALID_PIN) {
      authenticatedClients.add(socket.id);
      socket.emit('auth_result', { success: true, agents: Array.from(agents.entries()) });
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
    console.log('Relaying action to:', action.targetId, action);
    if (action.targetId && agents.has(action.targetId)) {
      io.to(action.targetId).emit('execute', action);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use(express.static('../client'));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
