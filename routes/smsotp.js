const express = require('express');
var bodyParser = require('body-parser');
const router = express.Router();
const textflow = require('textflow.js');

textflow.useKey('eFdFbedRUiUmlbtR2kir99zD7erXILDF9VUgehn3JfRP1EcCVGMiR4OWGjuzdzrt');


module.exports = () => {
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: true }));

    router.post('/send', async (req, res) => {
        try {
            const { phoneNumber } = req.body;
            
            if (!phoneNumber) {
                return res.status(400).json({ success: false, message: 'Phone number is required' });
            }
            console.log('Attempting to send OTP to:', phoneNumber);
            const result = await textflow.sendVerificationSMS(phoneNumber);
            console.log('Textflow response:', result);

            if (result.ok) {
                return res.status(200).json({ success: true, message: 'OTP sent successfully' });
            } else {
                return res.status(500).json({ success: false, message: result.message || 'Failed to send OTP' });
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    router.post('/verify', async (req, res) => {
        try {
            const { phoneNumber, otp } = req.body;
            
            if (!phoneNumber || !otp) {
                return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
            }

            console.log('Attempting to verify OTP:', { phoneNumber, otp });
            const result = await textflow.verifyCode(phoneNumber, otp);
            console.log('Verification response:', result);

            if (!result.valid) {
                return res.status(400).json({ success: false, message: 'Invalid OTP' });
            } else {
                return res.status(200).json({ success: true, message: 'OTP verified successfully' });
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    return router;
}
