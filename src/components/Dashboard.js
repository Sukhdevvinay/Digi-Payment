// src/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import SendMoney from './SendMoney';
import '../Stylesheet/Dashboard.css'

import config from '../config';

const Dashboard = () => {
  const [showSendModal, setShowSendModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [currentUser, setCurrentUser] = useState({ name: "User", email: "" });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch User
      const userRes = await fetch(`${config.API_URL}/user/getuser`, { headers });
      if (userRes.ok) {
        const userData = await userRes.json();
        setCurrentUser(userData);
      }

      // Fetch Balance
      const balanceRes = await fetch(`${config.API_URL}/transaction/balance`, { headers });
      const balanceData = await balanceRes.json();
      if (balanceRes.ok) setBalance(balanceData.balance);

      // Fetch History
      const historyRes = await fetch(`${config.API_URL}/transaction/history`, { headers });
      const historyData = await historyRes.json();
      if (historyRes.ok) setTransactions(historyData);

    } catch (err) {
      console.error("Error fetching dashboard data", err);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchData(); // Poll every 3 seconds
    }, 3000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleSendClick = () => {
    setShowSendModal(true);
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h3>SukhBank Lite</h3>
        <div className="user-profile">
          <span>Hello, {currentUser.name.split(' ')[0]}</span>
          <div className="avatar">{currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}</div>
          <button className="logout-btn" onClick={() => window.location.href = '/logout'}>Logout</button>
        </div>
      </nav>

      <div className="content">
        <div className="balance-card">
          <p>Your Balance</p>
          <h1>₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h1>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/add-money')}>Add Money</button>
            <button className="action-btn" onClick={handleSendClick}>Send Money</button>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="history-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Recent Transactions</h3>
              <button
                onClick={() => navigate('/history')}
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}
              >
                View All
              </button>
            </div>
            {transactions.length === 0 ? <p>No transactions yet</p> : (
              <ul className="transaction-list">
                {transactions.map(t => (
                  <li key={t._id} className={`transaction-item ${t.type.toLowerCase()}`}>
                    <div className="t-info">
                      <span className="t-desc">{t.description}</span>
                      <span className="t-date">{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                    <span className="t-amount">
                      {t.type === 'CREDIT' ? '+' : '-'} ₹{t.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {showSendModal && <SendMoney onClose={() => setShowSendModal(false)} onSendSuccess={fetchData} />}
    </div>
  );
};

export default Dashboard;
