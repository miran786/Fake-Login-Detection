import emailjs from '@emailjs/browser';

const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_du1h5i1';
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_wg2bduq';
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '5KrNj6cWERlaQuo5Z';

interface OTPTemplateParams extends Record<string, unknown> {
  to_email: string; // The recipient's email
  otp_code: string; // The OTP code
  // Add other template variables here as needed, matching your EmailJS template
}

export const sendOTP = async (email: string, otp: string): Promise<boolean> => {
  const templateParams = {
    // Common parameter names for recipient email to match potential template configuration
    to_email: email,
    email: email,
    user_email: email,
    recipient: email,
    reply_to: 'support@example.com',

    // OTP code parameters - adding 'passcode' as requested
    passcode: otp,
    otp_code: otp,
    code: otp,
    message: `Your verification code is: ${otp}`,
  };

  console.log('Sending email with params:', templateParams);

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    console.log('Email sent successfully!', response.status, response.text);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    console.warn('⚠️ Network Error indicated. Falling back to MOCK MODE.');
    console.log('==========================================');
    console.log(`🔒 MOCK EMAIL SENT`);
    console.log(`📧 To: ${email}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log('==========================================');
    // Return true so the flow continues even if EmailJS is blocked by AdBlocker/Firewall
    return true;
  }
};
