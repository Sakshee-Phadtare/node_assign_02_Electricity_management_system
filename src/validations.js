import Joi from "joi";

export const userSchema = Joi.object().keys({
  username: Joi.string()
    .pattern(/^[a-zA-Z][a-zA-Z0-9._]{2,30}/)
    .required(),
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required(),
  address: Joi.string().max(255).required(),
  pincode: Joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .required(),
  password: Joi.string()
    .pattern(/^[0-9a-zA-Z#@\$\?]{6,20}$/)
    .required(),
});

export const updateUserSchema = Joi.object().keys({
  username: Joi.string()
    .pattern(/^[a-zA-Z][a-zA-Z0-9._]{2,30}/)
    .required(),
  address: Joi.string().max(255).required(),
  pincode: Joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .required(),
});

export const createMeterReadingSchema = Joi.object().keys({
  meter_number: Joi.string()
    .pattern(/^MTR-\d{3}/)
    .required(),
  reading_date: Joi.date().max(Date.now()),
  consumption: Joi.number().min(1),
});

export const addMeterReadingSchema = Joi.object().keys({
  reading_date: Joi.date().required(),
  consumption: Joi.number().min(0).required(),
  is_bill_paid: Joi.boolean(),
});

export const updateMeterReadingSchema = Joi.object().keys({
  reading_date: Joi.date().required(),
  consumption: Joi.number().min(0).required(),
  is_bill_paid: Joi.boolean(),
});

export const superadminSchema = Joi.object().keys({
  new_role_id: Joi.valid(1, 2).required(),
});

export const loginSchema = Joi.object().keys({
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required(),
  password: Joi.string()
    .pattern(/^[0-9a-zA-Z#@\$\?]{6,20}$/)
    .required(),
});
