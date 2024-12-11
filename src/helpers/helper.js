import connection from "../config/db.js";

export const runQuery = (sql, parameters) => {
    return new Promise((resolve, reject) => {
      connection.query(sql, parameters, (error, results) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(results); 
        }
      });
    });
  };

  //validation function
export const validateInput = (data, schema) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    return error.details.map((detail) => detail.message);
  }
  return null;
};
