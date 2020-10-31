const jwt = require("jsonwebtoken");

verifyToken = (req, res, next) => {
    const token = req.header("auth-token");

    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        req.user = jwt.verify(token, process.env.TOKEN_SECRET);
        next();
    } catch (err) {
        res.status(400).json({ message: err });
    }
};

module.exports = verifyToken;
