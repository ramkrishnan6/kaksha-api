const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const authRoute = require("./routes/auth");
const dashboardRoute = require("./routes/dashboard");
const classRoute = require("./routes/class");

const User = require("./models/User");
const ClassLog = require("./models/ClassLog");
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
}

function removeClientFromMap(userName, socketId, roomId, role) {
    if (role == "student") {
        if (rooms[roomId]["students"].has(userName)) {
            let userSocketIdSet = rooms[roomId]["students"].get(userName);

            userSocketIdSet.delete(socketId);

            if (userSocketIdSet.size == 0) {
                rooms[roomId]["students"].delete(userName);
            }
        }
    }

    if (role == "teacher") {
        if (rooms[roomId]["teachers"].has(userName)) {
            let userSocketIdSet = rooms[roomId]["teachers"].get(userName);

            userSocketIdSet.delete(socketId);

            if (userSocketIdSet.size == 0) {
                rooms[roomId]["teachers"].delete(userName);
            }
        }
    }
}

server.listen(8000, async () => console.log("Server is running on port 8000"));

const sendClassStatus = (socket) => {
    let roomId = socket.handshake.query.roomId;
    let classStatus = null;
    socket.join(roomId);

    try {
        classStatus = rooms[roomId]["is_active"];
    } catch {
        rooms[roomId] = {};
        rooms[roomId]["students"] = new Map();
        rooms[roomId]["teachers"] = new Map();
        rooms[roomId]["is_active"] = false;
        classStatus = false;
    }

    io.in(roomId).emit("class-status", classStatus);
};

const startClass = (classId) => {
    rooms[classId]["is_active"] = true;
    console.log(rooms);

    io.in(classId).emit("class-started", true);
};

const notifyUserJoined = (classId, userName) => {
    io.in(classId).emit(
        "user-connected",
        [...rooms[classId]["students"].keys()],
        [...rooms[classId]["teachers"].keys()],
        userName
    );
};

const notifyUserLeft = (classId, userName) => {
    io.in(classId).emit(
        "user-disconnected",
        [...rooms[classId]["students"].keys()],
        [...rooms[classId]["teachers"].keys()],
        userName
    );
};

const getUserInfo = async (socket) => {
    let userDetails = await User.findById(socket.userId);

    return {
        userName: userDetails["first_name"].concat(
            " ",
            userDetails["last_name"]
        ),
        user: userDetails,
    };
};

io.on("connection", (socket) => {
    sendClassStatus(socket);

    socket.on("start-class", (classId) => {
        startClass(classId);
        logStartClass(classId);
    });

    socket.on("join-class", async (classId) => {
        if (rooms[classId]["is_active"]) {
            let { userName, user } = await getUserInfo(socket);

            logUser(classId, socket.userId, Date.now(), "in");
            addClientToMap(userName, socket.id, classId, user["role"]);
            notifyUserJoined(classId, userName);

            socket.on("disconnect", () => {
                logUser(classId, socket.userId, Date.now(), "out");
                removeClientFromMap(userName, socket.id, classId, user["role"]);
                notifyUserLeft(classId, userName);
            });

            socket.on("class-end", (classId) => {
                removeClientFromMap(userName, socket.id, classId, user["role"]);
                logEndClass(classId);

                io.in(classId).emit("leave-room");
                rooms[classId]["is_active"] = false;
            });
        }
    });
});

const logEndClass = async (classId) => {
    await Class.updateOne(
        { number: classId },
        {
            $set: {
                is_active: false,
                ended_at: Date.now(),
            },
        }
    );
};

const logStartClass = async (classId) => {
    await Class.update(
        { number: classId },
        {
            is_active: true,
            started_at: Date.now(),
        },
        { upsert: true }
    );
};

const logUser = async (roomId, userId, time, type) => {
    try {
        const log = await ClassLog.create({
            class_number: roomId,
            time: time,
            type: type,
            user: userId,
        });

        await Class.update(
            { number: roomId },
            {
                $push: {
                    logs: log._id,
                },
            }
        );
    } catch (err) {
        console.log(err);
    }
};
