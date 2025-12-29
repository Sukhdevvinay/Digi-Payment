import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import config from '../config';

// Simple UUID generator (or use uuid package if available, but doing custom for MERN strictness)
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const AddMoney = () => {
    const [amount, setAmount] = useState("");
    const [idempotencyKey, setIdempotencyKey] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        setIdempotencyKey(generateUUID());
    }, []);

    const handleAddMoney = async () => {
        try {
            const res = await fetch(`${config.API_URL}/transaction/add`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    amount: Number(amount),
                    idempotencyKey
                }),
            });

            if (res.ok) {
                alert('Money added successfully!');
                navigate('/Dashboard');
            } else {
                const data = await res.json();
                alert(`Failed: ${data.message}`);
            }
        } catch (err) {
            console.error("Error adding money:", err);
            alert("Something went wrong");
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Add Money</h2>
            <div className="amount-input">
                <label>Amount (in ₹)</label>
                <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginTop: '10px', fontSize: '1.2rem' }}
                />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>Transaction ID: {idempotencyKey}</p>

            <button
                className="confirm-btn"
                onClick={handleAddMoney}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    marginTop: '20px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                }}
            >
                Add Money securely
            </button>
            <button
                onClick={() => navigate('/Dashboard')}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    marginTop: '10px',
                    cursor: 'pointer'
                }}
            >
                Cancel
            </button>
        </div>
    );
};

export default AddMoney;
