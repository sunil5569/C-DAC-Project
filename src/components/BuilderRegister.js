import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import axios from 'axios';

export default function Register() {
  const { registration } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactInfo, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verify, setVerify] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState('');

  const form = useRef();

//   const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#\-]).{4,8}$/;
  const emailPattern = /^([a-zA-Z0-9]([a-zA-Z0-9_\.]+)?[a-zA-Z0-9])@(([a-zA-Z0-9]([a-zA-Z0-9\-]+)?[a-zA-Z0-9])\.([a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)$/;

  const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    return code;
  };

  const sendVerificationEmail = (code) => {
    form.current.verification_code.value = code; // Set the verification code in the hidden input field
    form.current.to_email.value = email; // Set the user's email in the hidden input field
    form.current.to_name.value = name;
    // form.current.companyName.value = companyName; 
    // form.current.from_name.value = 'Raviraj Buildtech'; // Set the sender's name in the hidden input field

    emailjs.sendForm('service_jsznche', 'template_6jtufww', form.current, 'ZMSRjw8HqBjxGTSBm')
      .then((response) => {
        console.log('Email sent successfully:', response.status, response.text);
        setEmailSent(true); // Indicate that the email was sent successfully
      }, (err) => {
        console.error('Failed to send email:', err.text);
        setError('Failed to send verification email. Please try again.');
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate name, email, and password

    if (!emailPattern.test(email)) {
      setError('Invalid email format');
      return;
    }
    // if (!passwordPattern.test(password)) {
    //   setError('Invalid password format');
    //   return;
    // }

    const code = generateVerificationCode();
    sendVerificationEmail(code);
    setVerify(true); // Show verification input
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (verifyCode === generatedCode) {
      setVerificationSuccess(true);
      try {
        // POST request to the registration API
        const response = await axios.post('http://localhost:8686/api/builders', {
          name,
          companyName,
          contactInfo,
          email,
          password
        });
        console.log('User registered successfully:', response.data);
        setVerify(false);
        navigate("/builderlogin");
      } catch (err) {
        console.error('Registration failed:', err.response ? err.response.data : err.message);
        setError('Registration failed. Please try again.');
      }
    } else {
      setError('Invalid verification code');
    }
  };

  return (
    <div>
      <div className="container">
        <div className="row justify-content-center mt-5">
          <div className="col-md-6">
            <form className="registration-form" ref={form} onSubmit={verify ? handleVerify : handleSubmit}>
              <h2 className="mb-4">Builder Registration</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              {!verify && (
                <>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="to_name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastname">Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="companyname"
                      name="company_name"
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastname">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="contact"
                      name="contact"
                      placeholder="Enter Your Contact Number"
                      value={contactInfo}
                      onChange={(e) => setContact(e.target.value)}
                      required
                    />
                  </div>


                  <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="to_email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <input type="hidden" name="verification_code" />
                  <input type="hidden" name="from_name" />
                  <button type="submit" className="btn btn-primary btn-block">Register</button>
                  {emailSent && <div className="alert alert-success mt-3">Verification email sent successfully.</div>}
                </>
              )}
              {verify && (
                <>
                  <div className="form-group">
                    <p>Code is sent to your email</p>
                    <label htmlFor="verifyCode">Verify Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter verification code"
                      onChange={(e) => setVerifyCode(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">Verify</button>
                  {verificationSuccess && <div className="alert alert-success mt-3">Code verified successfully. Redirecting to login...</div>}
                </>
              )}
              <div className="text-center mt-3">
                <Link to={"/builderlogin"} className="login-link">Already have an account? Login here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
