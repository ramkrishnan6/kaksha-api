const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const dashboardRoute = require("./routes/dashboard");
const classRoute = require("./routes/class");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Class = require("./models/Class");

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
app.use("/class", classRoute);

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

function addClientToMap(userName, socketId, roomId, role) {
    if (!rooms[roomId]) {
        rooms[roomId] = {};
        rooms[roomId]["students"] = new Map();
        rooms[roomId]["teachers"] = new Map();
    }

    if (role == "student") {
        if (!rooms[roomId]["students"].has(userName)) {
            rooms[roomId]["students"].set(userName, new Set([socketId]));
        } else {
            rooms[roomId]["students"].get(userName).add(socketId);
        }
    }

    if (role == "teacher") {
        if (!rooms[roomId]["teachers"].has(userName)) {
            rooms[roomId]["teachers"].set(userName, new Set([socketId]));
        } else {
            rooms[roomId]["teachers"].get(userName).add(socketId);
        }
    }
    console.log(rooms);
}

function removeClientFromMap(userName, socketId, roomId, role) {
    if (role == "student") {
        if (rooms[roomId]["students"].has(userName)) {
            let userSocketIdSet = rooms[roomId]["students"].get(userName);

            userSocketIdSet.delete(socketId);

            if (userSocketIdSet.size == 0) {
                rooms[roomId]["students"].delete(userName);
            }
            console.log(rooms);

            // if (rooms[roomId].size == 0) {
            //     delete rooms[roomId];
            // }
        }
    }

    if (role == "teacher") {
        if (rooms[roomId]["teachers"].has(userName)) {
            let userSocketIdSet = rooms[roomId]["teachers"].get(userName);

            userSocketIdSet.delete(socketId);

            if (userSocketIdSet.size == 0) {
                rooms[roomId]["teachers"].delete(userName);
            }
            console.log(rooms);

            // if (rooms[roomId].size == 0) {
            //     delete rooms[roomId];
            // }
        }
    }
}
server.listen(8000, async () => console.log("Server is running on port 8000"));

io.on("connection", (socket) => {
    socket.on("join-room", async (roomId) => {
        let user = await User.findById(socket.userId);
        let userName = user["first_name"].concat(" ", user["last_name"]);

        addClientToMap(userName, socket.id, roomId, user["role"]);
        socket.join(roomId);
        io.sockets
            .in(roomId)
            .emit(
                "user-connected",
                [...rooms[roomId]["students"].keys()],
                [...rooms[roomId]["teachers"].keys()]
            );

        socket.on("class-end", (roomId) => {
            removeClientFromMap(userName, socket.id, roomId, user["role"]);

            io.sockets
                .in(roomId)
                .emit(
                    "leave-room",
                    [...rooms[roomId]["students"].keys()],
                    [...rooms[roomId]["teachers"].keys()]
                );
        });

        socket.on("disconnect", () => {
            removeClientFromMap(userName, socket.id, roomId, user["role"]);
            io.sockets
                .in(roomId)
                .emit(
                    "user-disconnected",
                    [...rooms[roomId]["students"].keys()],
                    [...rooms[roomId]["teachers"].keys()]
                );
        });
    });
});
