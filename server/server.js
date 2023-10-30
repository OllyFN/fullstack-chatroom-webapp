import { getMessages, sendMessage, newUser, authenticateUser } from './database.js'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

// static variable init
const SHOW_MESSAGE_AMOUNT = 10

// server init
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  serveClient: false
})

// express
app.use(express.json())
app.use(express.static('../client/dist'));
app.get('/messages', async (req, res) => {
  const newMessages = await getMessages(SHOW_MESSAGE_AMOUNT)
  res.send(newMessages)
})

// socket.io
io.on('connection', (socket) => {
  console.log('USER CONNECTED')

  socket.on('auth', async (username, password) => {
    const auth = await authenticateUser(username, password).then(res => res[0][0])
    io.to(socket.id).emit('auth response', auth.length==0 ? -1 : auth[0].id)
  })

  socket.on('new message', async (userid, message) => {
    // the await here is weird, but if the message is sent and then someone new joins while its still being processed
    // then the message will be sent to everyone EXCEPT the newly connected client; rare edge case but better safe than sorry.
    console.log(`${userid}: ${message}`)
    await sendMessage(userid, message)
    socket.broadcast.emit('message', userid, message)
  })
  
  socket.on('new user', async (username, password) => {
    console.log('recieved new user ' + username + ' with pass of ' + password)
    
    try {
      const newUserID = await newUser(username, password)
      io.to(socket.id).emit('new user id', newUserID[0][0][0].newUserID)
    }catch (err) {
      io.to(socket.id).emit('new user error',err?.code ?? 'Unkown error')
    }
  })

  socket.on('error', (err) => {
    console.error(err)
  })

  socket.on('disconnect', () => {
    console.log('USER DISCONNECTED')
  })
})

httpServer.listen(process.env.WEBSERVER_PORT, () => {
  console.log('Listening on port ' + process.env.WEBSERVER_PORT)
})