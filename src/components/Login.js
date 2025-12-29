// src/Auth.js
import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import '../Stylesheet/Login.css';
const Login = () => {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const navigate = useNavigate();

  const loginfunction = async(e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/login/login",{
      method : "POST",
      headers: {
          'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({email,password}),
    });
    try {
        if (res.status === 200) { // Succesfully Login
          navigate('/Dashboard');
        } else { // failed to Login
          console.log("Failed to login");
        }
      } catch(e) {
        console.error("Response was not JSON:", e);
      }
    } catch(err) {
      console.log("Login Failed",err);
    }
  }
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{'Welcome Back'}</h2>
          <p>Secure Digital Payments</p>
        </div>
        
        <div className="auth-tabs">
          <button className="active">Login</button>
          {/* <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Sign Up</button> */}
        </div>

        <form className="auth-form" method = "post" onSubmit={loginfunction}>
          {/* {!isLogin && <input type="text" placeholder="Full Name" className="input-field" />} */}
          <input type="email" placeholder="Email Address" className="input-field" value = {email} onChange = {(e) => setEmail(e.target.value)}/>
          <input type="password" placeholder="Password" className="input-field" value = {password} onChange = {(e) => setPassword(e.target.value)}/>
          <button type="submit" className="submit-btn">{'Login In'}</button>
          <a href = "/Signup" className="signup">{'Create Account'}</a>
        </form>
      </div>
    </div>
  );
};

export default Login;