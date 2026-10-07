const transporter = require('../config/email.config');


const sendEmail = async (req, user,password) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject:"Register Successfull",
            html :`
            <p>Dear ${user.name},</p>
            <p>Thank you for signing up to our clinic. Your registration was successful.</p>
            <p>We are excited to have you on board and look forward to providing you with the best healthcare services.</p>
            <p>Email : ${user.email}</p>,
            <p>Password  : ${password}</p> (temporary password, please change it after login)
            <p>Best regards,</p>
            `
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
}


module.exports = sendEmail;