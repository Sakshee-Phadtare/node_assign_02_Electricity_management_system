// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Invalid input data',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid credentials',
  PASSWORD_MISMATCH: 'Password does not match',
  JWT_GENERATION_ERROR: 'Error generating JWT token',
  LOGIN_ERROR: 'Error during login',
  SERVER_ERROR: 'Internal server error',
  EMAIL_TAKEN: 'Email is already taken',
  METER_NOT_FOUND: 'Meter not found',
  READING_EXISTS: 'A meter reading already exists for this month.',
  READING_NOT_FOUND: 'Meter reading not found',
  INVALID_ROLE_ID: 'Invalid role ID. Only Admin or user is allowed.',
  ROLE_UPDATE_FAILED: 'User not found or role not updated.',
  READING_DATE_REQUIRED: 'Reading ID is required.',
  USER_NOT_FOUND: 'User not found or already deleted',
  USER_NOT_FOUND_OR_METER_IN_USE: 'User not found or meter number already in use',
  METER_READING_EXISTS: 'A meter reading already exists for this month.',
  METER_READING_NOT_FOUND: 'Meter reading not found',
  READING_ID_REQUIRED: 'Reading ID is required',
  ROLE_NOT_UPDATED: 'User not found or role not updated',
  USER_NOT_FOUND: 'User not found',
  NO_FILE_UPLOAD:'No file uploaded',
  ONLY_CSV_ALLOWED:'Only CSV files are allowed',
  MISSING_VAL_CSV:'Missing values in CSV row',
  USER_NOT_EXIST:'User ID does not exist',
  METER_NOT_ASSOCIATED_WITH_USER:'Meter ID is not associated with the User ID',
  ERROR_PROCEESSING_CSV:'Error processing CSV file'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  METER_CREATED: 'Meter created and reading recorded successfully',
  METER_READING_ADDED: 'Meter reading added successfully',
  METER_READING_UPDATED: 'Meter reading updated successfully',
  METER_READING_DELETED: 'Meter reading deleted successfully',
  ROLE_UPDATED: 'Role updated successfully',
  METER_READINGS_FETCHED: 'Meter readings fetched successfully',
  METER_USER_READINGS_FETCHED: 'User Meter mapping data fetched successfully',
  USER_PROFILE_FETCHED: 'User profile fetched successfully',
  USERS_RETRIEVED: 'Users retrieved successfully',
  USER_SOFT_DELETED: 'User soft deleted successfully',
  METER_READING_CREATED: 'Meter created and reading (if provided) recorded successfully',
  METER_READING_ADDED: 'Meter reading added successfully',
  METER_NOT_FOUND_OR_READING_EXISTS: 'Meter not found for the specified user and meter number, or a reading already exists for this date.',
  METER_READING_UPDATED: 'Meter reading updated successfully',
  METER_READING_DELETED: 'Meter reading deleted successfully',
  METER_READINGS_FETCHED: 'Meter readings fetched successfully',
  ROLE_UPDATED: 'Role updated successfully',
  MONTHLY_CONSUMPTION_FETCHED: 'Monthly consumption data fetched successfully.',
  YEARLY_CONSUMPTION_FETCHED: 'Yearly consumption data fetched successfully.',
  MONTHLY_CREATED_USERS_FETCHED: 'Monthly created users data fetched successfully.',
  YEARLY_CREATED_USERS_FETCHED: 'Yearly created users data fetched successfully.',
  MONTHLY_CREATED_METERS_FETCHED: 'Monthly created meters data fetched successfully.',
  YEARLY_CREATED_METERS_FETCHED: 'Yearly created meters data fetched successfully.',
  CSV_PROCESSED_SUCCESSFULLY:'CSV processed successfully'
};

// Status Codes
export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

export const ROLES = {
  ADMIN: 1,
  USER: 2,
  SUPER_ADMIN: 3,
};