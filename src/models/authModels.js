import { runQuery } from '../helpers/helper.js';

// Function to get all users
export const getAllUsers = async () => {
  const query = `
    SELECT 
      u.user_id, u.username, u.email, u.address, u.pincode, 
      u.created_at, u.updated_at, r.role_name 
    FROM Users u
    LEFT JOIN Roles r ON u.role_id = r.role_id
    WHERE u.is_deleted = FALSE;
  `;
  return await runQuery(query);
};

// Fetch user details by email
export const getUserByEmail = async (email) => {
  const query = `
      SELECT 
        user_id, 
        username, 
        password, 
        role_id, 
        is_deleted 
      FROM Users 
      WHERE email = ? AND is_deleted = FALSE
    `;
  return await runQuery(query, [email]);
};

export const checkUsernameExists = async (username) => {
  const query = `
      SELECT user_id 
      FROM users 
      WHERE username = ? AND is_deleted = FALSE
    `;
  return await runQuery(query, [username]);
};

// Fetch role ID by email
export const getRoleIdByEmail = async (email) => {
  const query = `
      SELECT 
        role_id 
      FROM Users 
      WHERE email = ? AND is_deleted = FALSE
    `;
  return await runQuery(query, [email]);
};

// Fetch user ID by email
export const getUserIdByEmail = async (email) => {
  const query = `
      SELECT 
        user_id 
      FROM Users 
      WHERE email = ? AND is_deleted = FALSE
    `;
  return await runQuery(query, [email]);
};

// Function to create a new user
export const createUser = async (username, email, hashedPassword, address, pincode) => {
  const insertQuery = `
      INSERT INTO Users (username, email, password, created_at, created_by, address, pincode, is_deleted)
      VALUES (?, ?, ?, NOW(), NULL, ?, ?, FALSE)
    `;
  const values = [username, email, hashedPassword, address, pincode];
  const result = await runQuery(insertQuery, values);

  const updateQuery = 'UPDATE Users SET created_by = ? WHERE user_id = ?';
  await runQuery(updateQuery, [result.insertId, result.insertId]);

  return result.insertId;
};

// Function to get user by id
export const getUserById = async (userId) => {
  const query = `
    SELECT user_id, username, email, address, pincode, role_id 
    FROM Users 
    WHERE user_id = ? AND is_deleted = FALSE;
  `;
  return await runQuery(query, [userId]);
};

// Function to update a user
export const updateUser = async (userId, username, email, address, pincode, updatedBy) => {
  const query = `
    UPDATE Users
    SET username = ?, email = ?, address = ?, pincode = ?, updated_at = NOW(), updated_by = ?
    WHERE user_id = ? AND is_deleted = FALSE;
  `;
  const params = [username, email, address, pincode, updatedBy, userId];
  return await runQuery(query, params);
};

// Function to check if a user exists
export const checkUserExists = async (userId) => {
  const query = 'SELECT * FROM Users WHERE user_id = ? AND is_deleted = FALSE';
  return await runQuery(query, [userId]);
};

// Function to soft delete a user by setting is_deleted to TRUE
export const softDeleteUserById = async (userId) => {
  const query = 'UPDATE Users SET is_deleted = TRUE WHERE user_id = ? AND is_deleted = FALSE';
  return await runQuery(query, [userId]);
};


export const createMeterReadingInDB = async (userId, meterNumber, readingDate, consumption, createdBy) => {
  // Checking if user exists and is not deleted
  const checkUserQuery = "SELECT * FROM Users WHERE user_id = ? AND is_deleted = FALSE";
  const userResult = await runQuery(checkUserQuery, [userId]);

  if (userResult.length === 0) {
    return false;
  }

  // Check if meter already exists
  const checkMeterQuery = "SELECT * FROM Meters WHERE meter_number = ?";
  const meterResult = await runQuery(checkMeterQuery, [meterNumber]);

  // If the meter exists, return false (to prevent duplicates)
  if (meterResult.length > 0) {
    return false;
  }

  // Insert meter into Meters table
  const insertMeterQuery = `
      INSERT INTO Meters (meter_number, created_at, created_by)
      VALUES (?, NOW(), ?)
  `;
  await runQuery(insertMeterQuery, [meterNumber, createdBy]);

  // Fetch the meter ID
  const meterIdQuery = "SELECT meter_id FROM meters WHERE meter_number = ?";
  const meter_id_result = await runQuery(meterIdQuery, [meterNumber]);
  const meterId = meter_id_result[0].meter_id;

  // Assign the meter to the user in the user_meter_mapping table
  const insertMeterIdQuery = `
      INSERT INTO user_meter_mapping (user_id, meter_id, created_by, created_at)
      VALUES (?, ?, ?, NOW())
  `;
  const userMeterValues = [userId, meterId, createdBy];
  await runQuery(insertMeterIdQuery, userMeterValues);

  // If reading data is provided, insert meter reading
  if (readingDate && consumption) {
    // Calculate bill amount and set bill status
    const billAmount = consumption * 10;
    const isBillPaid = false;

    // Fetch user_meter_map_id
    const userMeterMapIdQuery = `
          SELECT user_meter_map_id 
          FROM user_meter_mapping 
          WHERE user_id = ? AND meter_id = ?
      `;
    const user_meter_map_id_result = await runQuery(userMeterMapIdQuery, [userId, meterId]);
    const userMeterMapId = user_meter_map_id_result[0].user_meter_map_id;

    // Insert meter reading
    const insertReadingQuery = `
          INSERT INTO Meter_Readings (reading_date, user_meter_map_id, consumption, bill_amount, is_bill_paid, created_at, created_by)
          VALUES (?, ?, ?, ?, ?, NOW(), ?)
      `;
    const readingValues = [readingDate, userMeterMapId, consumption, billAmount, isBillPaid, createdBy];
    await runQuery(insertReadingQuery, readingValues);
  }

  return true;  // Return success
};

// Function to add meter reading
export const addMeterReadingInDB = async (userId, meterNumber, readingDate, consumption, isBillPaid, createdBy) => {
  // finding meter_id using user_id and meter_number
  const findMeterQuery = `
    SELECT meter_id 
    FROM Meters 
    WHERE meter_number = ?
  `;
  const meterResult = await runQuery(findMeterQuery, [meterNumber]);

  if (meterResult.length === 0) {
    return false;
  }

  const meterId = meterResult[0].meter_id;

  //finding user_meter_map_id from meter_id
  const userMeterMapId = `
    Select user_meter_map_id from
    user_meter_mapping 
    where meter_id=?`;

  const userMeterIdResult = await runQuery(userMeterMapId, [meterId]);


  //extracting usermetermapId
  const userMeterMapID = userMeterIdResult[0].user_meter_map_id;


  // Checking if a reading already exists for the same meter_id and reading_date
  const checkDuplicateReadingQuery = `
    SELECT * 
    FROM Meter_Readings 
    WHERE user_meter_map_id = ? AND reading_date = ?
  `;
  const duplicateResult = await runQuery(checkDuplicateReadingQuery, [userMeterMapID, readingDate]);

  if (duplicateResult.length > 0) {
    return false;
  }


  const ratePerUnit = 10;
  const billAmount = consumption * ratePerUnit;

  //  Inserting the meter reading into Meter_Readings table
  const insertReadingQuery = `
    INSERT INTO Meter_Readings (
       user_meter_map_id, reading_date, consumption, bill_amount, is_bill_paid, 
      created_at, created_by, updated_at, updated_by
    ) 
    VALUES ( ?, ?, ?, ?, ?, NOW(), ?, NOW(), ?)
  `;
  await runQuery(insertReadingQuery, [userMeterMapID, readingDate, consumption, billAmount, isBillPaid, createdBy, createdBy]);

  return true;
};

export const updateMeterReadingInDB = async (readingId, consumption, readingDate, is_bill_paid, updatedBy) => {
  const ratePerUnit = 10;
  const billAmount = consumption * ratePerUnit;


  const updateReadingQuery = `
        UPDATE Meter_Readings 
        SET consumption = ?, reading_date = ?,bill_amount=?, is_bill_paid=?, updated_at = NOW(), updated_by = ? 
        WHERE reading_id = ? AND is_deleted = FALSE
    `;
  const result = await runQuery(updateReadingQuery, [consumption, readingDate, billAmount, is_bill_paid, updatedBy, readingId]);

  return result.affectedRows > 0;
};

export const deleteMeterReadingInDB = async (readingId, deletedBy) => {
  const deleteReadingQuery = `
        UPDATE Meter_Readings 
        SET is_deleted = TRUE, updated_at = NOW(), updated_by = ? 
        WHERE reading_id = ?
    `;
  const result = await runQuery(deleteReadingQuery, [deletedBy, readingId]);

  return result.affectedRows > 0;
};

export const getSpecificUserMeterReadingsFromDB = async (user_id, meterNumber) => {
  // finding meter_id using user_id and meter_number
  const findMeterQuery = `
    SELECT meter_id 
    FROM Meters 
    WHERE meter_number = ?
  `;
  const meterResult = await runQuery(findMeterQuery, [meterNumber]);

  if (meterResult.length === 0) {
    return false;
  }
  const meterId = meterResult[0].meter_id;

  //finding user_meter_map_id from meter_id
  const userMeterMapId = `
   Select user_meter_map_id from
   user_meter_mapping 
   where meter_id=?`;

  const userMeterIdResult = await runQuery(userMeterMapId, [meterId]);

  //extracting usermetermapId
  const userMeterMapID = userMeterIdResult[0].user_meter_map_id;

  //finding meter readings from meter reading table using user_meter_map_id
  const meterReadingQuery = `
   Select * from
   meter_readings
   where user_meter_map_id=? 
   and is_deleted = false`;

  return await runQuery(meterReadingQuery, [userMeterMapID]);
};


export const getMeterReadingsFromDB = async () => {
  const getAllReadingsQuery = `
    SELECT 
	    u.username,
      mr.reading_id, 
      um.user_id, 
      um.meter_id,
      m.meter_number,
      mr.reading_date, 
      mr.consumption, 
      mr.bill_amount, 
      mr.is_bill_paid, 
      mr.created_at, 
      mr.created_by, 
      mr.updated_at, 
      mr.updated_by, 
      mr.is_deleted
    FROM meter_readings mr
    JOIN user_meter_mapping um ON mr.user_meter_map_id = um.user_meter_map_id
    JOIN meters m ON um.meter_id = m.meter_id 
    JOIN users u ON um.user_id = u.user_id 
    WHERE mr.is_deleted = FALSE;
  `;
  return await runQuery(getAllReadingsQuery);
};


export const getMeterNumberById = async (meterId) => {

  const getMeterNumberQuery = `
       SELECT meter_number from meters 
      where meter_id =${meterId} AND is_deleted = FALSE
    `;
  return await runQuery(getMeterNumberQuery, [result.meter_id]);

}

export const updateUserRoleInDB = async (user_id, new_role_id, updated_by) => {
  const query = `
    UPDATE Users
    SET role_id = ?, updated_by = ?, updated_at = NOW()
    WHERE user_id = ? AND is_deleted = FALSE
  `;
  const params = [new_role_id, updated_by, user_id];
  return await runQuery(query, params);
};

export const checkMonthlyReadingExists = async (userId, meterNumber, readingDate) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM Meter_Readings mr
    JOIN user_meter_mapping umm ON mr.user_meter_map_id = umm.user_meter_map_id
    JOIN meters m ON umm.meter_id = m.meter_id
    WHERE umm.user_id = ? 
      AND m.meter_number = ?
      AND MONTH(mr.reading_date) = MONTH(?) 
      AND YEAR(mr.reading_date) = YEAR(?)
  `;

  const result = await runQuery(query, [userId, meterNumber, readingDate, readingDate]);
  return result[0].count > 0;
};


export const getMonthlyConsumptionData = async () => {
  const monthlyConsumptionQuery = `
    SELECT 
      MONTH(reading_date) AS month, 
      YEAR(reading_date) AS year, 
      SUM(consumption) AS total_consumption 
    FROM Meter_Readings 
    GROUP BY YEAR(reading_date), MONTH(reading_date)
    ORDER BY YEAR(reading_date), MONTH(reading_date);
  `;

  return await runQuery(monthlyConsumptionQuery);
};

export const getYearlyConsumptionData = async () => {
  const yearlyConsumptionQuery = `
    SELECT 
      YEAR(reading_date) AS year, 
      SUM(consumption) AS total_consumption 
    FROM Meter_Readings 
    GROUP BY YEAR(reading_date)
    ORDER BY YEAR(reading_date);
  `;

  return await runQuery(yearlyConsumptionQuery);
};

export const getMonthlyCreatedUsersData = async () => {
  const monthlyCreatedUsersQuery = `
    SELECT 
      MONTH(created_at) AS month, 
      YEAR(created_at) AS year, 
      COUNT(user_id) AS total_users 
    FROM Users 
    WHERE is_deleted = FALSE
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY YEAR(created_at), MONTH(created_at);
  `;

  return await runQuery(monthlyCreatedUsersQuery);
};

export const getYearlyCreatedUsersData = async () => {
  const yearlyCreatedUsersQuery = `
    SELECT 
      YEAR(created_at) AS year, 
      COUNT(user_id) AS total_users 
    FROM Users 
    WHERE is_deleted = FALSE
    GROUP BY YEAR(created_at)
    ORDER BY YEAR(created_at);
  `;

  return await runQuery(yearlyCreatedUsersQuery);
};

export const getMonthlyCreatedMetersData = async () => {
  const monthlyCreatedMetersQuery = `
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') AS month, 
      COUNT(meter_id) AS total_meters 
    FROM Meters 
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY DATE_FORMAT(created_at, '%Y-%m');
  `;

  return await runQuery(monthlyCreatedMetersQuery);
};

export const getYearlyCreatedMetersData = async () => {
  const yearlyCreatedMetersQuery = `
    SELECT 
      DATE_FORMAT(created_at, '%Y') AS year, 
      COUNT(meter_id) AS total_meters 
    FROM Meters 
    GROUP BY DATE_FORMAT(created_at, '%Y')
    ORDER BY DATE_FORMAT(created_at, '%Y');
  `;

  return await runQuery(yearlyCreatedMetersQuery);
};

export const checkMonthlyReadingExistsInUpdate = async (userId, readingDate) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM Meter_Readings mr
    JOIN user_meter_mapping umm ON mr.user_meter_map_id = umm.user_meter_map_id
    JOIN meters m ON umm.meter_id = m.meter_id
    WHERE umm.user_id = ? 
      AND MONTH(mr.reading_date) = MONTH(?) 
      AND YEAR(mr.reading_date) = YEAR(?)
  `;

  const result = await runQuery(query, [userId, readingDate, readingDate]);
  return result[0].count > 0;
};


export const userDashboardReadingsFromDB = async (user_id) => {
  // finding meter readings using user_id 
  const findMeterReadingsQuery = `
  select u.user_id,
		um.user_meter_map_id,
        m.meter_number,
        um.meter_id,
        mr.reading_date,
        mr.consumption,
        mr.bill_amount,
        mr.is_bill_paid
	  from users u
    join user_meter_mapping um 
    on u.user_id = um.user_id
    join meter_readings mr
    on mr.user_meter_map_id = um.user_meter_map_id
    join meters m 
    on m.meter_id = um.meter_id
    where u.user_id=?;
`;
  return await runQuery(findMeterReadingsQuery, [user_id]);

};

export const validateUser = async (user_id) => {
  const query = `SELECT COUNT(*) AS count FROM users WHERE user_id = ? AND is_deleted = 0`;
  const result = await runQuery(query, [user_id]);
  return result[0].count > 0;
};

export const validateMeter = async (user_id, meter_id) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM user_meter_mapping
    WHERE user_id = ? AND meter_id = ? AND is_deleted = 0
  `;
  const result = await runQuery(query, [user_id, meter_id]);
  return result[0].count > 0;
};

export const insertReadings = async (readings) => {
  const insertPromises = readings.map(({ user_id, meter_id, consumption, reading_date }) => {
    const ratePerUnit = 10;
    const billAmount = consumption * ratePerUnit;
    const query = `
      INSERT INTO meter_readings (user_meter_map_id, reading_date, consumption, bill_amount, created_at, created_by)
      SELECT user_meter_map_id, ?, ?,?, NOW(), ?
      FROM user_meter_mapping
      WHERE user_id = ? AND meter_id = ? AND is_deleted = 0
    `;
    return runQuery(query, [reading_date, consumption, billAmount, user_id, user_id, meter_id]);
  });
  await Promise.all(insertPromises);
};

export const getAllUserMeterMappingDataFromDB = async () => {
  const getAllMappingQuery = `
    select um.user_id,
      um.meter_id,
      m.meter_number,
      u.username
      from meters m
      join user_meter_mapping um
      on m.meter_id = um.meter_id
      join users u
      on u.user_id = um.user_id;
  `;
  return await runQuery(getAllMappingQuery);
};
