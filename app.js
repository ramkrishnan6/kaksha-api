const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const dashboardRoute = require("./routes/dashboard");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

dotenv.config();
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }, () =>
    console.log("Connected to the Database")
);

app.use(cors());
app.use(express.json());
app.use("/user", authRoute, dashboardRoute);

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.query.token;
        const payload = jwt.verify(token, process.env.TOKEN_SECRET);
        socket.userId = payload._id;

        next();
    } catch (err) {
        console.log(err);
    }
});

const rooms = {};

function addClientToMap(userName, socketId, roomId, tp) {
    if (!rooms[roomId]) {
        rooms[roomId] = new Map();
    }

    if (!rooms[roomId].has(userName)) {
        rooms[roomId].set(userName, new Set([socketId]));
    } else {
        rooms[roomId].get(userName).add(socketId);
    }
    console.log(rooms);
}

function removeClientFromMap(userName, socketId, roomId) {
    if (rooms[roomId].has(userName)) {
        let userSocketIdSet = rooms[roomId].get(userName);

        userSocketIdSet.delete(socketId);

        if (userSocketIdSet.size == 0) {
            rooms[roomId].delete(userName);
        }
        console.log(rooms);

        // if (rooms[roomId].size == 0) {
        //     delete rooms[roomId];
        // }
    }
}
server.listen(8000, async () => {
    try {
        users = await User.find();
    } catch (err) {
        console.log(err);
    }
    console.log("Server is running on port 8000");
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
        let user = users.find((u) => u._id == socket.userId);

        let i = 1;
        if (i == 0) {
            socket.emit("end");
            socket.disconnect();
        }

        addClientToMap(user["first_name"], socket.id, roomId);
        socket.join(roomId);
        io.sockets.in(roomId).emit("user-connected", [...rooms[roomId].keys()]);
        socket.on("disconnect", () => {
            removeClientFromMap(user["first_name"], socket.id, roomId);
            io.sockets
                .in(roomId)
                .emit("user-disconnected", [...rooms[roomId].keys()]);
        });
    });
});
