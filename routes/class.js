const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const Class = require("../models/Class");

router.post("", verifyToken, async (req, res) => {
    try {
        const updated = await Class.update(
            { number: req.body.number },
            {
                is_active: req.body.is_active,
                started_at: req.body.started_at,
                ended_at: req.body.ended_at,
            },
            { upsert: true }
        );

        res.json(updated);
    } catch (err) {
        res.json({ message: err });
    }
});

router.get("/:id", verifyToken, async (req, res) => {
    try {
        classData = await Class.findOne({
            number: req.params.id,
        }).populate({
            path: "logs",
            populate: {
                path: "user",
            },
        });
        if (classData) {
            res.json({
                data: classData,
            });
        } else res.json({ data: { is_active: false } });
    } catch (err) {
        res.json({ message: err });
    }
});

router.put("/:id", verifyToken, async (req, res) => {
    try {
        const updatedClass = await Class.updateOne(
            { number: req.params.id },
            {
                $set: {
                    is_active: req.body.is_active,
                    ended_at: req.body.ended_at,
                },
            }
        );
        res.json(updatedClass);
    } catch (err) {
        res.json(err);
    }
});

router.get("", verifyToken, async (req, res) => {
    try {
        const classes = await Class.find().populate({
            path: "logs",
            populate: {
                path: "user",
            },
        });
        res.json({ data: classes });
    } catch (err) {
        res.json(err);
    }
});

module.exports = router;
