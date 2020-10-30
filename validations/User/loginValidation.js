const Joi = require("@hapi/joi");

const loginValidation = (data) => {
    const rules = Joi.object({
        email: Joi.string().min(3).required().email(),
        password: Joi.string().min(6).required(),
    });

    return rules.validate(data);
};

module.exports = loginValidation;
