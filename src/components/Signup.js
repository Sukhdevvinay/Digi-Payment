// src/Auth.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Stylesheet/Login.css';
import config from '../config';

const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const Singupfunction = async (e) => {
    e.preventDefault();
    try {   // Sending a data to this end Point after filling this form
      const res = await fetch(`${config.API_URL}/Signup/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });
      try {
        if (res.status === 200) { // Succesfully signedup
          navigate('/Dashboard');
        } else { // failed to signedup
          //   alert(data.message); 
        }
      } catch (e) {
        console.error("Response was not JSON:", e);
      }
    } catch (err) {
      console.log("Signup Error : ", err);
    }
  }
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{'Create Account'}</h2>
          <p>Secure Digital Payments</p>
        </div>

        <div className="auth-tabs">
          <button className="active">Singup</button>
        </div>

        <form className="auth-form" method="post" onSubmit={Singupfunction}>
          <input type="text" placeholder="Full Name" className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" placeholder="Email Address" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="input-field" valie={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="submit-btn">{'Get Start'}</button>
          <a href="/login" className="signup">{'Login Credentials'}</a>
        </form>
      </div>
    </div>
  );
};

export default Login;
