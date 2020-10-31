const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const User = require("../models/User");

router.get("/dashboard", verifyToken, async (req, res) => {
    const { first_name, last_name, email, role } = await User.findOne({
        _id: req.user._id,
    });
    res.json({
        data: {
            message: "This is your dashboard",
            first_name: first_name,
            last_name: last_name,
            email: email,
            role: role,
        },
    });
});

module.exports = router;
