// src/components/SendMoney.js
import React, { useState, useEffect } from 'react';

import config from '../config';

// Simple UUID generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const SendMoney = ({ onClose, onSendSuccess }) => {
  // ... state ...
  const [step, setStep] = useState(1);
  const [searchEmail, setSearchEmail] = useState("");
  const [recipient, setRecipient] = useState(null); // { name, email }
  const [amount, setAmount] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentPayees, setRecentPayees] = useState([]);

  // Fetch Recent Payees on validation step
  useEffect(() => {
    if (step === 1) {
      fetch(`${config.API_URL}/transaction/recent-payees`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setRecentPayees(data);
        })
        .catch(err => console.error("Error fetching payees", err));
    }
  }, [step]);

  // Generate Key when entering Payment Step
  useEffect(() => {
    if (step === 2) {
      setIdempotencyKey(generateUUID());
    }
  }, [step]);

  const handleVerify = async () => {
    if (!searchEmail) return alert("Please enter an email");
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/user/verify`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: searchEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setRecipient(data);
        setStep(2);
      } else {
        alert(data.message || "User not found");
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying user");
    } finally {
      setLoading(false);
    }
  };

  const handleRecentClick = (payee) => {
    setRecipient(payee);
    setStep(2);
  };

  const handleTransfer = async () => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/transaction/send`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          recipientEmail: recipient.email,
          amount: Number(amount),
          idempotencyKey
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Success: ${data.message}`);
        onSendSuccess();
        onClose();
      } else {
        alert(`Transfer Failed: ${data.message}`);
        setIdempotencyKey(generateUUID()); // Retry key
      }
    } catch (err) {
      console.error("Error sending money:", err);
      alert("Network error or Server down.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Send Money</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {step === 1 ? (
          <div className="step-1">
            <p>Enter email to verify user</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="email"
                placeholder="Recipient Email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                style={{ flex: 1, padding: '10px' }}
              />
              <button onClick={handleVerify} disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                {loading ? '...' : 'Verify'}
              </button>
            </div>

            {recentPayees.length > 0 && (
              <div className="recent-payees">
                <h4>Recent Payees</h4>
                <div className="payee-list">
                  {recentPayees.map((p, idx) => (
                    <div key={idx} className="payee-item" onClick={() => handleRecentClick(p)}>
                      <div className="avatar-small">{p.name[0]}</div>
                      <div className="payee-info">
                        <span>{p.name}</span>
                        <small>{p.email}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="step-2">
            <div className="recipient-details">
              <div className="avatar-green">{recipient.name[0]}</div>
              <h3>{recipient.name}</h3>
              <p>{recipient.email}</p>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.8rem' }}>Change Recipient</button>
            </div>

            <div className="amount-input">
              <label>Amount (in ₹)</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>

            <p style={{ fontSize: '0.8rem', color: '#ccc', marginTop: '10px' }}>Ref: {idempotencyKey}</p>

            <button
              className="confirm-btn"
              onClick={handleTransfer}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Processing...' : 'Send ₹' + amount}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .payee-list {
            margin-top: 10px;
        }
        .payee-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border: 1px solid #eee;
            margin-bottom: 5px;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .payee-item:hover {
            background: #f9fafb;
        }
        .payee-info {
            margin-left: 10px;
            display: flex;
            flex-direction: column;
        }
        .payee-info span {
            font-weight: 500;
        }
        .payee-info small {
            color: #666;
            font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};

export default SendMoney;
