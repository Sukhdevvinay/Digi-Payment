import React, { useState, useEffect } from "react";
// import "./App.css";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup"
import SendMoney from "./components/SendMoney";
import { Routes,Route } from "react-router";

function App() {
  return (
    <>
    <Routes>
          <Route path = "/login" element = {<Login/>} />;
          <Route path = "/Dashboard" element = {<Dashboard/>}/> 
          {/* <Route path = "/Draw" element = {<Draw/>}/>  */}
          <Route path = "/Signup" element = {<Signup/>}/>
          <Route path = "/logout" element = {<Login/>}/>
      </Routes>
    </>
  )
};

export default App;