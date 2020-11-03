const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const Class = require("../models/Class");

router.post("", verifyToken, async (req, res) => {
    try {
        const updated = await Class.update(
            { number: req.body.number },
            {
                is_active: req.body.is_active,
            },
            { upsert: true }
        );

        res.json(updated);
    } catch (err) {
        res.json({ message: err });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { number, is_active } = await Class.findOne({
            number: req.params.id,
        });

        res.json({
            data: {
                number: number,
                is_active: is_active,
            },
        });
    } catch {
        res.json({
            data: {
                number: req.params.id,
                is_active: false,
            },
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updatedPost = await Class.updateOne(
            { number: req.params.id },
            { $set: { is_active: req.body.is_active } }
        );
        res.json(updatedPost);
    } catch (err) {
        res.json(err);
    }
});

module.exports = router;
