// src/SendMoney.js
import React, { useState } from 'react';
// import '';

const SendMoney = ({ user, onClose }) => {
  const [amount, setAmount] = useState("");

  const handleTransfer = () => {
    alert(`Initiated Transfer of ₹${amount} to ${user.name}`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Send Money</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="recipient-details">
          <div className="avatar-green">{user.name[0]}</div>
          <h3>{user.name}</h3>
          <p>Processing secure payment</p>
        </div>

        <div className="amount-input">
            <label>Amount (in ₹)</label>
            <input 
                type="number" 
                placeholder="Enter amount" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
        </div>

        <button className="confirm-btn" onClick={handleTransfer}>
            Initiate Transfer
        </button>
      </div>
    </div>
  );
};

export default SendMoney;