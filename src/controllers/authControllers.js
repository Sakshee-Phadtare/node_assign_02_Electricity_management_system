import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  getUserByEmail, getRoleIdByEmail, createUser, getUserById, getAllUsers, updateUser, softDeleteUserById, createMeterReadingInDB, addMeterReadingInDB, updateMeterReadingInDB, deleteMeterReadingInDB, getMeterReadingsFromDB, getSpecificUserMeterReadingsFromDB, updateUserRoleInDB, checkMonthlyReadingExists,
  getMonthlyConsumptionData, getYearlyConsumptionData, getMonthlyCreatedUsersData, getYearlyCreatedUsersData, getMonthlyCreatedMetersData, getYearlyCreatedMetersData, checkUsernameExists,getAllUserMeterMappingDataFromDB
  , getMeterNumberById, getRoleIdByUserId,checkMonthlyReadingExistsInUpdate, getUserIdByEmail, userDashboardReadingsFromDB, validateUser, validateMeter, insertReadings, checkDuplicateReading
} from '../models/authModels.js';
import { createMeterReadingSchema } from '../validations.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, STATUS_CODES } from '../constants.js';
import { validateInput } from '../helpers/helper.js';

import { Readable, pipeline } from 'stream';
import csvParser from 'csv-parser';

// Login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetching user details
    const userResult = await getUserByEmail(email);
    if (!userResult.length) {
      throw { status: STATUS_CODES.NOT_FOUND, message: ERROR_MESSAGES.USER_NOT_FOUND };
    }
    const user = userResult[0];

    // Comparing password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { status: STATUS_CODES.UNAUTHORIZED, message: ERROR_MESSAGES.INVALID_CREDENTIALS };
    }

    // Fetching role ID
    const roleIdResult = await getRoleIdByEmail(email);
    const roleId = roleIdResult[0]?.role_id;

    // Fetching user ID
    const userIdResult = await getUserIdByEmail(email);
    const userId = userIdResult[0]?.user_id;

    // Generating JWT token
    const token = jwt.sign(
      { userId: user.user_id, roleId: roleId },
      process.env.JWT_SECRET
    );

    res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      token,
      statusCode: STATUS_CODES.SUCCESS,
      role_id: roleId,
      user_id: userId,
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};

// Create user function
export const createUserController = async (req, res) => {
  try {
    const { username, email, password, address, pincode } = req.body;


    const existingUser = await getUserByEmail(email);
    if (existingUser.length > 0) {
      throw {
        status: STATUS_CODES.BAD_REQUEST,
        message: ERROR_MESSAGES.EMAIL_TAKEN,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await createUser(username, email, hashedPassword, address, pincode);

    res.status(STATUS_CODES.CREATED).json({
      message: SUCCESS_MESSAGES.USER_CREATED,
      userId,
      statusCode: STATUS_CODES.CREATED,
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};

// Get user profile function
export const getUserProfile = async (req, res) => {
  try {
    const {user_id: userId} = req;

    const userProfile = await getUserById(userId);
    
    if (!userProfile) {
      throw {
        status: STATUS_CODES.NOT_FOUND,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      };
    }

    res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.USER_PROFILE_FETCHED,
      profile: userProfile,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};

// Get all users function
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();

    if (!users.length) {
      throw {
        status: STATUS_CODES.NOT_FOUND,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      };
    }

    res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.USERS_RETRIEVED,
      users,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error retrieving users:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};

// Update user function
export const updateUserController = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { username, address, pincode } = req.body; 

    const userExists = await getUserById(user_id);
    if (!userExists.length) {
      throw {
        status: STATUS_CODES.NOT_FOUND,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      };
    }

    await updateUser(user_id, username, address, pincode, req.user_id); 

    res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.USER_UPDATED,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};

//soft delete user
export const softDeleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const role= await getRoleIdByUserId(user_id);

    if(role[0].role_id === 3)
    {
      return res.status(STATUS_CODES.FORBIDDEN).json({message: 'cant delete this user'})
    }

    const result = await softDeleteUserById(user_id);

    if (result.affectedRows === 0) {
      throw {
        status: STATUS_CODES.NOT_FOUND,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      };
    }

    res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.USER_SOFT_DELETED,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error soft deleting user:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};


//create meter also reading if provided/optional
export const createMeterReading = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { meter_number, reading_date, consumption } = req.body;
   
    const validationErrors = (reading_date?.length === 0 && consumption?.length === 0) ? validateInput(
      { meter_number },
      createMeterReadingSchema
    ) : validateInput(
      { meter_number, reading_date, consumption },
      createMeterReadingSchema
    );
    if (validationErrors) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ errors: validationErrors });
    }

    // Checking if a reading already exists for the same user, meter, and month
    const isReadingExists = await checkMonthlyReadingExists(user_id, meter_number, reading_date);
    if (isReadingExists) {
      throw {
        status: STATUS_CODES.BAD_REQUEST,
        message: ERROR_MESSAGES.METER_READING_EXISTS,
      };
    }

    const result = await createMeterReadingInDB(user_id, meter_number, reading_date, consumption, req.user_id);

    if (result) {
      return res.status(STATUS_CODES.CREATED).json({
        message: SUCCESS_MESSAGES.METER_READING_CREATED,
        statusCode: STATUS_CODES.CREATED,
      });
    } else {
      throw {
        status: STATUS_CODES.NOT_FOUND,
        message: ERROR_MESSAGES.USER_NOT_FOUND_OR_METER_IN_USE,
      };
    }
  } catch (err) {
    console.error("Error creating meter reading:", err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};


//add meter reading
export const addMeterReading = async (req, res) => {
  try {
    const { user_id, meter_number } = req.params;
    const { reading_date, consumption, is_bill_paid } = req.body;

    await addMeterReadingInDB(user_id, meter_number, reading_date, consumption, is_bill_paid, req.user_id);

    return res.status(STATUS_CODES.CREATED).json({
      message: SUCCESS_MESSAGES.METER_READING_ADDED,
      statusCode: STATUS_CODES.CREATED,
    });
  } catch (err) {
    console.error("Error adding meter reading:", err);

    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};


//update meter reading
export const updateMeterReading = async (req, res) => {
  try {
    const { reading_id } = req.params;
    const { consumption, reading_date, is_bill_paid } = req.body;

    const user_id = req.user_id;

    // Checking if a reading already exists for the same user, meter, and month
    const isReadingExists = await checkMonthlyReadingExistsInUpdate(user_id, reading_date);
    if (isReadingExists) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: ERROR_MESSAGES.READING_ALREADY_PRESENT });
    }

    const result = await updateMeterReadingInDB(reading_id, consumption, reading_date, is_bill_paid, user_id);

    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.METER_READING_UPDATED,
        statusCode: STATUS_CODES.SUCCESS,
      });
    } else {
      throw {
        status: STATUS_CODES.NOT_FOUND,
        message: ERROR_MESSAGES.METER_READING_NOT_FOUND,
      };
    }
  } catch (err) {
    console.error('Error updating meter reading:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};

//delete meter reading
export const deleteMeterReading = async (req, res) => {
  try {
    const { reading_id } = req.params;

    if (!reading_id) {
      throw { status: STATUS_CODES.BAD_REQUEST, message: ERROR_MESSAGES.READING_ID_REQUIRED };
    }

    const result = await deleteMeterReadingInDB(reading_id, req.user_id);

    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.METER_READING_DELETED,
        statusCode: STATUS_CODES.SUCCESS,
      });
    } else {
      throw { status: STATUS_CODES.NOT_FOUND, message: ERROR_MESSAGES.METER_READING_NOT_FOUND };
    }
  } catch (err) {
    console.error('Error deleting meter reading:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};


//get specific user-meter readings
export const getSpecificUserMeterReadings = async (req, res) => {
  try {
    const { user_id, meter_number } = req.params;

    if (!user_id || !meter_number) {
      throw { status: STATUS_CODES.BAD_REQUEST, message: ERROR_MESSAGES.USER_ID_AND_METER_NUMBER_REQUIRED };
    }

    const result = await getSpecificUserMeterReadingsFromDB(user_id, meter_number);

    if (result.length === 0) {
      throw { status: STATUS_CODES.NOT_FOUND, message: ERROR_MESSAGES.METER_READING_NOT_FOUND };
    }

    return res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.METER_READINGS_FETCHED,
      data: result,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error fetching meter readings:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};


//get all meter readings
export const getAllMeterReadings = async (req, res) => {
  try {
    // Fetching the meter readings from DB
    const result = await getMeterReadingsFromDB();

    if (result.length === 0) {
      throw { status: STATUS_CODES.NOT_FOUND, message: ERROR_MESSAGES.METER_READING_NOT_FOUND };
    }

    // Formatting the result 
    const formattedData = result.map(reading => ({
      reading_id: reading.reading_id,
      username: reading.username,
      user_meter_map_id: {
        user_id: reading.user_id,
        meter_id: reading.meter_id,
      },
      meter_number: reading.meter_number,
      reading_date: reading.reading_date,
      consumption: reading.consumption,
      bill_amount: reading.bill_amount,
      is_bill_paid: reading.is_bill_paid,
      created_at: reading.created_at,
      created_by: reading.created_by,
      updated_at: reading.updated_at,
      updated_by: reading.updated_by,
      is_deleted: reading.is_deleted
    }));

    return res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.METER_READINGS_FETCHED,
      data: formattedData,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error fetching meter readings:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};

//superadmin -> change role
export const superAdminUpdateRole = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { new_role_id } = req.body;
    const updated_by = req.user_id;

    // Validating inputs
    if (!new_role_id) {
      throw { status: STATUS_CODES.BAD_REQUEST, message: ERROR_MESSAGES.NEW_ROLE_REQUIRED };
    }

    // Validating role ID
    if (![1, 2].includes(new_role_id)) {
      throw { status: STATUS_CODES.BAD_REQUEST, message: ERROR_MESSAGES.INVALID_ROLE_ID };
    }

    // Checking if the user exists
    const user = await getUserById(user_id);
    if (user.length === 0) {
      throw { status: STATUS_CODES.NOT_FOUND, message: ERROR_MESSAGES.USER_NOT_FOUND };
    }

    // Updating the user's role
    const result = await updateUserRoleInDB(user_id, new_role_id, updated_by);

    // Checking if the update was successful
    if (result.affectedRows === 0) {
      throw { status: STATUS_CODES.NOT_FOUND, message: ERROR_MESSAGES.ROLE_NOT_UPDATED };
    }

    res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.ROLE_UPDATED,
      updated_user_id: user_id,
      new_role_id,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
      message: error.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: error.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};

//monthly consumption chart
export const monthlyConsumption = async (req, res) => {
  try {
    const monthlyConsumptionData = await getMonthlyConsumptionData();

    if (!monthlyConsumptionData || monthlyConsumptionData.length === 0) {
      throw { status: STATUS_CODES.NOT_FOUND, message: ERROR_MESSAGES.NO_CONSUMPTION_DATA };
    }

    const formattedMonthlyData = monthlyConsumptionData.map((data) => ({
      month: data.month,
      year: data.year,
      totalConsumption: data.total_consumption,
    }));

    res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.MONTHLY_CONSUMPTION_FETCHED,
      monthlyData: formattedMonthlyData,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error fetching monthly consumption data:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};


//yearly consumption chart
export const yearlyConsumption = async (req, res) => {
  try {
    const yearlyConsumptionData = await getYearlyConsumptionData();

    if (!yearlyConsumptionData || yearlyConsumptionData.length === 0) {
      throw { status: STATUS_CODES.NOT_FOUND, message: ERROR_MESSAGES.NO_CONSUMPTION_DATA };
    }

    const formattedYearlyData = yearlyConsumptionData.map((data) => ({
      year: data.year,
      totalConsumption: data.total_consumption,
    }));

    res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.YEARLY_CONSUMPTION_FETCHED,
      yearlyData: formattedYearlyData,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error fetching yearly consumption data:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};


//monthly created user chart
export const getMonthlyCreatedUsers = async (req, res) => {
  try {
    const monthlyCreatedUsersData = await getMonthlyCreatedUsersData();

    if (!monthlyCreatedUsersData || monthlyCreatedUsersData.length === 0) {
      throw { status: STATUS_CODES.NOT_FOUND, message: ERROR_MESSAGES.NO_CREATED_USERS_DATA };
    }

    const formattedMonthlyData = monthlyCreatedUsersData.map((data) => ({
      month: data.month,
      year: data.year,
      totalUsers: data.total_users,
    }));

    res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.MONTHLY_CREATED_USERS_FETCHED,
      monthlyData: formattedMonthlyData,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error fetching monthly created users data:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};


//yearly created users chart
export const getYearlyCreatedUsers = async (req, res) => {
  try {
    const yearlyCreatedUsersData = await getYearlyCreatedUsersData();

    if (!yearlyCreatedUsersData || yearlyCreatedUsersData.length === 0) {
      throw { status: STATUS_CODES.NOT_FOUND, message: ERROR_MESSAGES.NO_CREATED_USERS_DATA };
    }

    const formattedYearlyData = yearlyCreatedUsersData.map((data) => ({
      year: data.year,
      totalUsers: data.total_users,
    }));

    res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.YEARLY_CREATED_USERS_FETCHED,
      yearlyData: formattedYearlyData,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error fetching yearly created users data:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};

//monthly created meter chart
export const getMonthlyCreatedMeters = async (req, res) => {
  try {
    const monthlyCreatedMetersData = await getMonthlyCreatedMetersData();

    if (!monthlyCreatedMetersData || monthlyCreatedMetersData.length === 0) {
      throw { status: STATUS_CODES.NOT_FOUND, message: ERROR_MESSAGES.NO_CREATED_METERS_DATA };
    }

    const formattedMonthlyData = monthlyCreatedMetersData.map((data) => ({
      month: data.month,
      totalMeters: data.total_meters,
    }));

    res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.MONTHLY_CREATED_METERS_FETCHED,
      monthlyData: formattedMonthlyData,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error fetching monthly created meters data:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};


//yearly created meter chart
export const getYearlyCreatedMeters = async (req, res) => {
  try {
    const yearlyCreatedMetersData = await getYearlyCreatedMetersData();

    if (!yearlyCreatedMetersData || yearlyCreatedMetersData.length === 0) {
      throw { status: STATUS_CODES.NOT_FOUND, message: ERROR_MESSAGES.NO_CREATED_METERS_DATA };
    }

    const formattedYearlyData = yearlyCreatedMetersData.map((data) => ({
      year: data.year,
      totalMeters: data.total_meters,
    }));

    res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.YEARLY_CREATED_METERS_FETCHED,
      yearlyData: formattedYearlyData,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error fetching yearly created meters data:', err);
    res.status(err.status || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: err.status || STATUS_CODES.SERVER_ERROR,
    });
  }
};

//user dashboard readings
export const userDashboardReadings = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Check if user_id is valid
    if (!user_id) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: ERROR_MESSAGES.USER_ID_REQUIRED,
        statusCode: STATUS_CODES.BAD_REQUEST,
      });
    }

    // Fetching the user dashboard readings from DB
    const result = await userDashboardReadingsFromDB(user_id);

    // If no readings are found for the user
    if (!result || result.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: ERROR_MESSAGES.NO_READINGS_FOUND,
        statusCode: STATUS_CODES.NOT_FOUND,
      });
    }

    return res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.METER_READINGS_FETCHED,
      data: result,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error fetching meter readings:', err);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      message: ERROR_MESSAGES.SERVER_ERROR,
      statusCode: STATUS_CODES.SERVER_ERROR,
    });
  }
};


//file upload
export const uploadCsvController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: ERROR_MESSAGES.NO_FILE_UPLOAD});
    }

    // Validating  file type
    if (req.file.mimetype.toLowerCase() !== 'text/csv' ||
      !req.file.originalname.toLowerCase().endsWith('.csv')) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: ERROR_MESSAGES.ONLY_CSV_ALLOWED });
    }

    const results = [];
    const validationErrors = [];
    const stream = Readable.from(req.file.buffer);

    pipeline(
      stream,
      csvParser(),
      async (dataStream) => {
        for await (const row of dataStream) {
          const sanitizedRow = Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key.trim(), value.trim()])
          );

          const { user_id, meter_id, consumption, reading_date } = sanitizedRow;

          if (!user_id || !meter_id || !consumption || !reading_date) {
            validationErrors.push({ row: sanitizedRow, error: ERROR_MESSAGES.MISSING_VAL_CSV });
            continue;
          }

          if (!(await validateUser(user_id))) {
            validationErrors.push({ row: sanitizedRow, error: ERROR_MESSAGES.USER_NOT_EXIST });
            continue;
          }

          if (!(await validateMeter(user_id, meter_id))) {
            validationErrors.push({
              row: sanitizedRow,
              error: ERROR_MESSAGES.METER_NOT_ASSOCIATED_WITH_USER,
            });
            continue;
          }

           // Check if record already exists
           if (await checkDuplicateReading(user_id, meter_id, reading_date)) {
            validationErrors.push({
              row: sanitizedRow,
              error: ERROR_MESSAGES.RECORD_ALREADY_EXISTS,
            });
            continue;
          }

          results.push({ user_id, meter_id, consumption, reading_date });
        }

        await insertReadings(results);

        res.status(STATUS_CODES.SUCCESS).json({
          message: SUCCESS_MESSAGES.CSV_PROCESSED_SUCCESSFULLY,
          insertedRecords: results.length,
          validationErrors,
        });
      },
      (err) => {
        if (err) {
          console.error('Error processing CSV:', err);
          res.status(STATUS_CODES.SERVER_ERROR).json({ message: ERROR_MESSAGES.ERROR_PROCEESSING_CSV });
        }
      }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

//get all meter readings
export const getAllUserMeterMappingData = async (req, res) => {
  try {
    // Fetching the user-meter mapping from DB
    const result = await getAllUserMeterMappingDataFromDB();

    // Check if no data is returned
    if (!result || result.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: ERROR_MESSAGES.NO_USER_METER_MAPPING_FOUND,
        statusCode: STATUS_CODES.NOT_FOUND,
      });
    }

    return res.status(STATUS_CODES.SUCCESS).json({
      message: SUCCESS_MESSAGES.METER_USER_READINGS_FETCHED,
      data: result,
      statusCode: STATUS_CODES.SUCCESS,
    });
  } catch (err) {
    console.error('Error fetching meter readings:', err);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      message: ERROR_MESSAGES.SERVER_ERROR,
      statusCode: STATUS_CODES.SERVER_ERROR,
    });
  }
};
