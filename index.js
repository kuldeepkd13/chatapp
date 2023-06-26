const express = require("express");
const {connection} = require("./config/db")
const {userRoute} = require("./routes/user.route")
const socketio = require("socket.io")
const http = require("http")
const cors = require("cors")
const app = express()
require("dotenv").config()
app.use(express.json())
app.use(cors())
const { userJoin, getRoomUsers, getCurrentUser, userLeave } = require("./utils/user")
const formateMessage = require("./utils/messages")
const server = http.createServer(app)
const io = socketio(server)

app.use("/user",userRoute)

const messages = {
    chatroom:[]
};

const boatName = "chat room";

io.on("connection", (socket) => {

    console.log("one client joined")

    socket.on("joinRoom", ({ username, room }) => {


        const user = userJoin(socket.id, username, room)

        socket.join(user.room);
         // history
        socket.emit("history",messages[user.room])

        // Welcome current 
        let formate = formateMessage(boatName, "Welcome to Server");

        // messages[user.room].push(formate);

        socket.emit("message",formate )

        formate = formateMessage(boatName, `${user.username} has joined the chat`);

        messages[user.room].push(formate)
        // broadcat to other users
        socket.broadcast.to(user.room).emit("message", formate )

        //  Get all room user
        console.log("hello")
        console.log(getRoomUsers(user.room))
        io.to(user.room).emit("roomUsers", {
            
            room: user.room, users: getRoomUsers(user.room)
            
        })

    })


    socket.on("chatMessage",(msg)=>{
          const user = getCurrentUser(socket.id)

          let formate = formateMessage(user.username,msg);
          messages[user.room].push(formate);
          io.to(user.room).emit("message",formate)
    });


    socket.on("disconnect",()=>{
        
        const user = userLeave(socket.id)

        let formate = formateMessage(boatName,`${user.username} has left the chat`)

                  messages[user.room].push(formate)
                  
        io.to(user.room).emit("message",formate)

          //  Get all room user
          io.to(user.room).emit("roomUsers", {
            room: user.room, users: getRoomUsers(user.room)
        })

    })

});

server.listen(process.env.Port,async()=>{
    try {
        await connection
        console.log("Connected to mongoose");
    } catch (error) {
        console.log(error)
        console.log("Not connected to mongoose")
    }
    console.log(`server is running at port ${process.env.Port}`)
})