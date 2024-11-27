const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, verifyUser, getUserByEmail } = require('../models/userModel');
const { sendVerificationEmail } = require('../utils/emailService');

const register = async (req, res) => {
  const { username, fullname, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  createUser({ username, fullname, email, password: hashedPassword, verificationCode }, (err) => {
    if (err) return res.status(500).json({ error: 'Database error.' });

    sendVerificationEmail(email, verificationCode)
      .then(() => res.status(200).json({ message: 'Verification email sent.' }))
      .catch(() => res.status(500).json({ error: 'Failed to send email.' }));
  });
};

const verify = (req, res) => {
  const { email, code } = req.body;

  getUserByEmail(email, (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'User not found.' });

    const user = results[0];
    if (user.verification_code === code) {
      verifyUser(email, (err) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        res.status(200).json({ message: 'Email verified successfully.' });
      });
    } else {
      res.status(400).json({ error: 'Invalid verification code.' });
    }
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  getUserByEmail(email, async (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'User not found.' });

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Email not verified.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful.', token });
  });
};

module.exports = { register, verify, login };
