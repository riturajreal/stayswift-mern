const Joi = require('joi');


// sever side validation functions

// --> listings
module.exports.listingSchema = Joi.object({

    listing : Joi.object({
        title:Joi.string().required(),
        description : Joi.string().required(),
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().required().min(0),
        image : Joi.string().allow("", null),

    }).required()
});

// --> reviews
module.exports.reviewSchema = Joi.object({
    review : Joi.object ({
        name : Joi.string().required(),
        rating : Joi.number().required(),
        comment : Joi.string().required(),
    }).required()
});