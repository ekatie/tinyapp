const bcrypt = require('bcryptjs');

/**
 * This function generates a random 6 character string to use as an ID.
 * @returns - String containing 6 random characters.
 */

const generateRandomString = function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';
  for (let i = 0; i < 6; i++) {
    randomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomId;
};

/**
 * This function checks if an email address is present in a particular database.
 * @param {String} email - Email address to search for.
 * @param {Object} database - Database to search in for email.
 * @returns - The user object that contains the email address, if found, or null.
 */

const findUserByEmail = function (email, database) {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
};

/**
 * This function check if the email and password combination entered by a user match the email and password of an existing account.
 * @param {String} email - Email associated with user acccount.
 * @param {String} password - Password associated with user email.
 * @returns - The user object of the authenticated account, or false if the authentication fails.
 */

const authenticateUser = function (email, password, database) {
  for (const userId in database) {
    if (database[userId].email === email && bcrypt.compareSync(password, database[userId].password)) {
      return database[userId];
    }
  }
  return false;
};

// Get current date
const getCurrentDate = function () {
  const timestamp = new Date();
  const year = timestamp.getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  const month = monthNames[timestamp.getMonth()];
  const day = timestamp.getDate();

  return `${month} ${day}, ${year}`;
};

module.exports = {
  findUserByEmail,
  authenticateUser,
  generateRandomString,
  getCurrentDate
};