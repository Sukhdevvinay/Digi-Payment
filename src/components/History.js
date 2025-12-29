import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import '../Stylesheet/Dashboard.css'; // Reusing dashboard styles

import config from '../config';

const History = () => {
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState(''); // '' = All, 'CREDIT', 'DEBIT'
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                type: filter,
                page: page,
                limit: 10
            }).toString();

            const res = await fetch(`${config.API_URL}/transaction/all?${query}`, { credentials: 'include' });
            const data = await res.json();

            if (res.ok) {
                setTransactions(data.transactions);
                setTotalPages(data.totalPages);
            }
        } catch (err) {
            console.error("Error fetching history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [filter, page]);

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => navigate('/Dashboard')} style={{ marginRight: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                        ←
                    </button>
                    <h3>Transaction History</h3>
                </div>
            </nav>

            <div className="content">
                <div className="history-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                    <div className="filters">
                        <button
                            className={`filter-btn ${filter === '' ? 'active' : ''}`}
                            onClick={() => { setFilter(''); setPage(1); }}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'CREDIT' ? 'active' : ''}`}
                            onClick={() => { setFilter('CREDIT'); setPage(1); }}
                        >
                            Credit
                        </button>
                        <button
                            className={`filter-btn ${filter === 'DEBIT' ? 'active' : ''}`}
                            onClick={() => { setFilter('DEBIT'); setPage(1); }}
                        >
                            Debit
                        </button>
                    </div>
                </div>

                <div className="history-section" style={{ minHeight: '400px' }}>
                    {loading ? <p style={{ textAlign: 'center', padding: '20px' }}>Loading...</p> : (
                        transactions.length === 0 ? <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No transactions found.</p> : (
                            <ul className="transaction-list">
                                {transactions.map(t => (
                                    <li key={t._id} className={`transaction-item ${t.type.toLowerCase()}`}>
                                        <div className="t-info">
                                            <span className="t-desc">{t.description}</span>
                                            <span className="t-date">{new Date(t.date).toLocaleString()}</span>
                                        </div>
                                        <span className="t-amount">
                                            {t.type === 'CREDIT' ? '+' : '-'} ₹{t.amount}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )
                    )}
                </div>

                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="page-btn"
                    >
                        Previous
                    </button>
                    <span style={{ alignSelf: 'center', color: '#666' }}>Page {page} of {totalPages || 1}</span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="page-btn"
                    >
                        Next
                    </button>
                </div>
            </div>

            <style>{`
                .filter-btn {
                    background: white;
                    border: 1px solid #ddd;
                    padding: 8px 16px;
                    margin-right: 10px;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-btn.active {
                    background: #111827;
                    color: white;
                    border-color: #111827;
                }
                .page-btn {
                    padding: 8px 16px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .page-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default History;
