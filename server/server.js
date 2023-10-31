import { getMessages, sendMessage, newUser, authenticateUser } from './database.js'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

// This is how many most recent messages a newly connected client will load
const SHOW_MESSAGE_AMOUNT = 10

// Server init
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  serveClient: false // Don't serve client files as they are included in the bundle
})

// Configure Express to use JSON parsing middleware
app.use(express.json());

// Define a route to handle GET requests to '/messages'
app.get('/messages', async (req, res) => {
  // Retrieve new messages from the 'getMessages' function
  const newMessages = await getMessages(SHOW_MESSAGE_AMOUNT);

  // Send the new messages as the response
  res.send(newMessages);
});
// socket.io connection event
io.on('connection', (socket) => {

  // Handle 'auth' event (invoked on sign up or login)
  socket.on('auth', async (username, password) => {
    // Check if the credentials are correct
    const auth = await authenticateUser(username, password).then(res => res[0][0]);

    // Emit 'auth response' event with the user ID or -1 if authentication failed
    io.to(socket.id).emit('auth response', auth.length === 0 ? -1 : auth[0].id);
  });

  // Handle 'new message' event with the message data as the arguments
  socket.on('new message', async (userid, message) => {
    // Send the new message to all connected clients
    await sendMessage(userid, message);
    // socket.broadcast.emit allows for sending the new message to all clients EXCEPT the sender
    socket.broadcast.emit('message', userid, message);
  });

  // Handle 'new user' event with credentials as arguments
  socket.on('new user', async (username, password) => {
    try {
      // Register a new user
      const newUserID = await newUser(username, password);
      io.to(socket.id).emit('new user id', newUserID[0][0][0].newUserID);
    } catch (err) { // I never yet had an error while registering a new user so this is just in case
      // Emit 'new user error' event with the error code or 'Unknown error'
      io.to(socket.id).emit('new user error', err?.code ?? 'Unknown error');
    }
  });
});

// Start the server
httpServer.listen(process.env.WEBSERVER_PORT, () => {
  console.log('Listening on port ' + process.env.WEBSERVER_PORT)
})