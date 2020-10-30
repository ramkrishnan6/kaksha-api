const Joi = require("@hapi/joi");

const registerValidation = (data) => {
    const rules = Joi.object({
        first_name: Joi.string().min(3).required(),
        last_name: Joi.string().min(3).required(),
        email: Joi.string().min(3).required().email(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid("student", "teacher").required(),
    });

    return rules.validate(data);
};

module.exports = registerValidation;
