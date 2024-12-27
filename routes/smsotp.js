import express from 'express';
import bodyParser from 'body-parser';
const router = express.Router();
import DescopeClient from '@descope/node-sdk';

const descopeClient = DescopeClient({ projectId: 'P2qf7v96bfN9nGc5kqeLgrwMExw1' });


export default () => {
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: true }));

    router.post('/sendPhone', async (req, res) => {
        try {
            const { phoneNumber } = req.body;

            if (phoneNumber === '' || phoneNumber === undefined) {
                throw new Error('Phone number is required');
            }
            let loginId = String(`+91${phoneNumber}`);
          

            const user = {
                name: 'Desmond Copland',
                phone: loginId, // Ensure phone is included
              };

           await descopeClient.otp.signUpOrIn['sms'](loginId, user)
           .then((response) => {
               console.log(response);
               return res.status(200).json({ success: true, message: 'OTP sent successfully' });
           })
              .catch((error) => {
                console.error('Error sending OTP:', error);
                return res.status(500).json({ success: false, message: 'Internal server error' });
              });
           
        } catch (error) {
            console.error('deScope Error:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    router.post('/verifyPhone', async (req, res) => {
        try {
            const { phoneNumber, otp } = req.body;
            let loginId = String(`+91${phoneNumber}`);
            let code = String(otp);
    
            const jwtResponse = await descopeClient.otp.verify['sms'](loginId, code);
    
            return res.status(200).json({
                success: true,
                sessionJwt: jwtResponse.data.sessionJwt,
                refreshJwt: jwtResponse.data.refreshJwt,
            });
        } catch (error) {
            console.error('Error verifying OTP:', error);
            
            // Handle specific error cases if necessary
            if (error.response && error.response.data) {
                return res.status(error.response.status).json({
                    success: false,
                    message: error.response.data.message || 'Verification failed',
                });
            }
    
            // General error handling
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });
    router.post('/sendEmail', async (req, res) => {
        try {
            const {name , email } = req.body;

            if (email === '' || email === undefined) {
                throw new Error('Phone number is required');
            }
            let loginId = String(`${email}`);
          

            const user = {
                name: name,
                email: loginId, // Ensure phone is included
              };

           await descopeClient.otp.signUpOrIn['email'](loginId, user)
           .then((response) => {
               console.log(response);
               return res.status(200).json({ success: true, message: 'OTP sent successfully' });
           })
              .catch((error) => {
                console.error('Error sending OTP:', error);
                return res.status(500).json({ success: false, message: 'Internal server error' });
              });
           
        } catch (error) {
            console.error('deScope Error:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });
    router.post('/verifyEmail', async (req, res) => {
        try {
            const { email, otp } = req.body;
            let loginId = String(`${email}`);
            let code = String(otp);
    
            const jwtResponse = await descopeClient.otp.verify['email'](loginId, code);
    
            return res.status(200).json({
                success: true,
                sessionJwt: jwtResponse.data.sessionJwt,
                refreshJwt: jwtResponse.data.refreshJwt,
            });
        } catch (error) {
            console.error('Error verifying OTP:', error);
            
            // Handle specific error cases if necessary
            if (error.response && error.response.data) {
                return res.status(error.response.status).json({
                    success: false,
                    message: error.response.data.message || 'Verification failed',
                });
            }
    
            // General error handling
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    

    return router;
}
