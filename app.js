const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }, () =>
    console.log("Connected to the Database")
);

app.listen(8000, () => console.log("Server is running on port 8000"));
