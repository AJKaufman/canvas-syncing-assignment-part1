const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// read the client html file into memory
// __dirname in node is the current directory
// (in this case the same folder as the server js file)
const index = fs.readFileSync(`${__dirname}/../client/index.html`);


const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);

// pass in the http server into socketio and grab the websocket server as io
const io = socketio(app);

// num to hold all of our connected users
const users = {};


const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', () => {
    let notACopy = false;
    let num;

    // assign a num (I didn't know that there was a socket.id until it was too late Q_Q)
    while (!notACopy) {
      num = Math.floor(Math.random() * 100);
      if (!users[num]) {
        users[num] = num;
        notACopy = true;
      }
    }


    // send the user to their room
    socket.join('room1');


    const getNextNum = () => {
      const messageData = {
        message: `<div>Hello, user ${num}!</div>`,
      };

      io.sockets.in('room1').emit('updatePara', messageData);
    };


    // send an id to be saved by the user
    setInterval(getNextNum, Math.floor(Math.random() * 1000) + 2000);
  });
};


io.sockets.on('connection', (socket) => {
  console.log('started');

  onJoined(socket);
});

console.log('Websocket server started');

