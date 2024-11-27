const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes'); // Import authentication routes
const { verify } = require('./controllers/authController'); // Import verify function
const { login } = require('./controllers/authController'); // Import login function
const { sendVerificationEmail } = require('./utils/emailService'); // Import email utility

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Authentication Routes
app.use('/auth', authRoutes);

// Test Email Sending Route (Optional for testing)
app.post('/test-email', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit code

    try {
        // Send the verification code to the user's email
        await sendVerificationEmail(email, verificationCode);
        res.status(200).json({ message: 'Verification email sent successfully!', code: verificationCode });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email.', error });
    }
});

// Verify Code Route
app.post('/verify', verify); // Use the verify function to verify the code

// Login Route
app.post('/login', login); // Use the login function to handle login

// Health Check Route (for debugging purposes)
app.get('/', (req, res) => {
    res.status(200).send('Server is running. Use /auth for authentication, /test-email to send emails, /verify to test verification, and /login to log in.');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
