// src/Dashboard.js
import React, { useState } from 'react';
import SendMoney from './SendMoney';
import '../Stylesheet/Dashboard.css'
const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock Data
  const users = [
    { id: 1, name: "Vinay Kumar", email: "vinay@example.com" },
    { id: 2, name: "Samantha", email: "sam@example.com" },
    { id: 3, name: "Ravi Shastri", email: "ravi@example.com" }
  ];

  const handleSendClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h3>PayTM Lite</h3>
        <div className="user-profile">
            <span>Hello, User</span>
            <div className="avatar">U</div>
        </div>
      </nav>

      <div className="content">
        <div className="balance-card">
          <p>Your Balance</p>
          <h1>₹ 10,450.00</h1>
        </div>

        <div className="users-section">
          <h3>Send Money</h3>
          <input type="text" placeholder="Search users..." className="search-bar" />
          
          <div className="user-list">
            {users.map(user => (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <div className="avatar-small">{user.name[0]}</div>
                  <div>
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                  </div>
                </div>
                <button className="send-btn" onClick={() => handleSendClick(user)}>Send Money</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && <SendMoney user={selectedUser} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Dashboard;