import React, { useState, useEffect } from "react";
// import "./App.css";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup"
import AddMoney from "./components/AddMoney";
import History from "./components/History";
import { Routes, Route } from "react-router";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />;
        <Route path="/Dashboard" element={<Dashboard />} />
        {/* <Route path = "/Draw" element = {<Draw/>}/>  */}
        <Route path="/Signup" element={<Signup />} />
        <Route path="/logout" element={<Login />} />
        <Route path="/add-money" element={<AddMoney />} />
        <Route path="/history" element={<History />} />
        {/* <Route path = "/SendMoney" element = {<SendMoney/>}/> */}
      </Routes>
    </>
  )
};

export default App;
