import { validateInput } from '../helpers/helper.js'; 
import { STATUS_CODES, ERROR_MESSAGES } from '../constants.js'; 
const validateRequest = (schema) => {
  return (req, res, next) => {
    const validationErrors = validateInput(req.body, schema); 
    if (validationErrors) {
      
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: validationErrors,
        statusCode: STATUS_CODES.BAD_REQUEST,
      });
    }
    next(); 
  };
};

export default validateRequest;
