const db = require('./db');

const createUser = (user, callback) => {
  const query = `
    INSERT INTO users (username, fullname, email, password, verification_code)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [user.username, user.fullname, user.email, user.password, user.verificationCode], callback);
};

const verifyUser = (email, callback) => {
  const query = `UPDATE users SET email_verified = true WHERE email = ?`;
  db.query(query, [email], callback);
};

const getUserByEmail = (email, callback) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  db.query(query, [email], callback);
};

module.exports = { createUser, verifyUser, getUserByEmail };
