const router = require("express").Router();
const User = require("../models/User");
const registerValidation = require("../validations/User/registerValidation");
const loginValidation = require("../validations/User/loginValidation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
    const { error } = registerValidation(req.body);

    if (error)
        return res.status(400).send({ message: error.details[0].message });

    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists)
        return res.status(400).send({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role,
    });

    try {
        const savedUser = await user.save();
        res.json({
            data: {
                id: savedUser.id,
                first_name: savedUser.first_name,
                last_name: savedUser.last_name,
                email: savedUser.email,
                role: savedUser.role,
            },
        });
    } catch (err) {
        res.json({ message: err });
    }
});

router.post("/login", async (req, res) => {
    const { error } = loginValidation(req.body);

    if (error)
        return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });

    if (!user)
        return res
            .status(400)
            .send({ message: "Email or password is incorrect" });

    const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
    );

    if (!isPasswordValid)
        return res
            .status(400)
            .send({ message: "Email or password is incorrect" });

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

    res.header("auth-token", token).json({
        message: `You are logged in as ${user.first_name} ${user.last_name} (${user.role})`,
    });
});

module.exports = router;
