const path = require("path");

const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessageObject } = require("./utils/messages");
const {
  getUsersInRoom,
  getUser,
  removeUser,
  addUser,
} = require("./utils/users");

const io = socketio(server); //Same server passed

const port = process.env.PORT || 8000;
//serve up the public directory
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));
//WS emitters & functions
// let count = 0;
//----------------NOTES------------------------
//without room - socket.emit, soket.broadcast.emit, io.emit
//with room - io.to(room).emit, socket.broadcast.to(room).emit, socket.emit (since only to that user)
//----------------End Of NOTES-----------------
//runs whenever the connection is established with that socket instance with that particular client
io.on("connection", (socket) => {
  console.log("New websocket connection");
  //this will be shown only to other users
  //   socket.emit("countUpdated", count);
  //   socket.on("increment", () => {
  //     count++;
  //     // socket.emit("countUpdated", count); //emits only to that particular client
  //     io.emit("countUpdated", count);
  //   });
  socket.on("sendMessage", (msg, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    io.to(user.room).emit(
      "message",
      generateMessageObject({
        message: msg && filter.clean(msg),
        userName: user.userName,
      })
    ); //this'll be got by all users incl. the current user
    callback(); //the callback is to send a feedback that msg is recievied by server
  });
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateMessageObject({
        message: `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
        userName: user.userName,
      })
    );
    callback();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessageObject({
          message: `${user.userName} has left!`,
          userName: "Admin",
        })
      ); //will also be sent to disconnected user but he won't recieve since he left
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
  //joining a room
  socket.on("join", ({ userName, room }, callback) => {
    const { error, user } = addUser({ userName, room, id: socket.id });
    if (error) {
      return callback(error);
    }

    socket.join(room);
    socket.emit(
      "message",
      generateMessageObject({ message: "Welcome !", userName: "Admin" })
    ); //this'll be shown only to that user
    socket.broadcast.to(room).emit(
      "message",
      generateMessageObject({
        message: `${userName} has joined!`,
        userName: "Admin",
      })
    );
    console.log("user", user, getUsersInRoom(user.room));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });
});

//Run the express server
server.listen(port, () => {
  console.log("Server is running on port " + port);
}); //Same server passed
