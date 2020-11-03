const mongoose = require("mongoose");

const classLogSchema = new mongoose.Schema({
    class_number: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        default: Date.now,
    },
    type: {
        type: String,
        enum: ["in", "out"],
        default: "in",
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = mongoose.model("ClassLog", classLogSchema);
