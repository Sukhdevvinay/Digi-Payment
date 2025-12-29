const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get Balance
router.get('/balance', auth, async (req, res) => {
    try {
        const email = req.user.email;
        const transactions = await Transaction.find({ userEmail: email });

        let balance = 0;
        transactions.forEach(t => {
            if (t.type === 'CREDIT') {
                balance += t.amount;
            } else {
                balance -= t.amount;
            }
        });

        res.json({ balance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Recent Payees (Derived from Debits)
router.get('/recent-payees', auth, async (req, res) => {
    try {
        const email = req.user.email;
        // Fetch recent debits to parse recipients
        const transactions = await Transaction.find({ userEmail: email, type: 'DEBIT' })
            .sort({ date: -1 })
            .limit(50); // Fetch enough to find 5 unique

        const uniquePayees = [];
        const seenEmails = new Set();

        for (const t of transactions) {
            if (uniquePayees.length >= 5) break;

            // Description format: "Sent money to Name (email)"
            // Regex to extract name and email
            const match = t.description.match(/Sent money to (.*) \((.*)\)/);
            if (match && match[2]) {
                const name = match[1];
                const payeeEmail = match[2];

                if (!seenEmails.has(payeeEmail)) {
                    seenEmails.add(payeeEmail);
                    uniquePayees.push({ name, email: payeeEmail, lastDate: t.date });
                }
            }
        }

        res.json(uniquePayees);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get History (Recent 5)
router.get('/history', auth, async (req, res) => {
    try {
        const email = req.user.email;
        const transactions = await Transaction.find({ userEmail: email })
            .sort({ date: -1 })
            .limit(5);

        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All History (Paginated & Filtered)
router.get('/all', auth, async (req, res) => {
    try {
        const email = req.user.email;
        const { type, page = 1, limit = 10 } = req.query;

        const filter = { userEmail: email };
        if (type && (type === 'CREDIT' || type === 'DEBIT')) {
            filter.type = type;
        }

        const transactions = await Transaction.find(filter)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Transaction.countDocuments(filter);

        res.json({
            transactions,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Money
router.post('/add', auth, async (req, res) => {
    try {
        const { amount, idempotencyKey } = req.body;
        const email = req.user.email;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Check for existing transaction with same key
        if (idempotencyKey) {
            const existingTx = await Transaction.findOne({ idempotencyKey });
            if (existingTx) {
                return res.status(200).json({ message: 'Money added successfully (Idempotent)' });
            }
        }

        const transaction = new Transaction({
            userEmail: email,
            type: 'CREDIT',
            amount: Number(amount),
            description: 'Added money to wallet',
            idempotencyKey
        });

        await transaction.save();
        res.json({ message: 'Money added successfully' });
    } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.idempotencyKey) {
            // Race condition: Key caused duplicate error, treat as success
            return res.status(200).json({ message: 'Money added successfully (Idempotent)' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send Money
// Send Money
router.post('/send', auth, async (req, res) => {
    // Note: Removed ACID transactions (mongoose.startSession) to support Standalone MongoDB instances.
    // In a production environment with a Replica Set, you should wrap this in a session.
    try {
        const { recipientEmail, amount, idempotencyKey } = req.body;
        const senderEmail = req.user.email;

        // 1. Validate Input
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }
        if (senderEmail === recipientEmail) {
            return res.status(400).json({ message: 'Cannot send money to yourself' });
        }

        // 2. Idempotency Check (Database)
        if (idempotencyKey) {
            // Check for the DEBIT transaction of this key
            const existingTx = await Transaction.findOne({ idempotencyKey: `${idempotencyKey}-DEBIT` });
            if (existingTx) {
                return res.status(200).json({ message: 'Money sent successfully (Idempotent)' });
            }
        }

        // 3. Check Recipient
        const recipient = await User.findOne({ email: recipientEmail });
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        // 4. Check Balance
        const senderTransactions = await Transaction.find({ userEmail: senderEmail });
        let senderBalance = 0;
        senderTransactions.forEach(t => {
            if (t.type === 'CREDIT') senderBalance += t.amount;
            else senderBalance -= t.amount;
        });

        if (senderBalance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // 5. Perform Transfer (Debit Sender, Credit Recipient)
        // Note: Without transactions, if the server crashes between these two saves, funds might be lost/inconsistent.
        const debitTx = new Transaction({
            userEmail: senderEmail,
            type: 'DEBIT',
            amount: Number(amount),
            description: `Sent money to ${recipient.name} (${recipientEmail})`,
            idempotencyKey: idempotencyKey ? `${idempotencyKey}-DEBIT` : undefined // Unique key for debit
        });
        await debitTx.save();

        const creditTx = new Transaction({
            userEmail: recipientEmail,
            type: 'CREDIT',
            amount: Number(amount),
            description: `Received money from ${senderEmail}`,
            idempotencyKey: idempotencyKey ? `${idempotencyKey}-CREDIT` : undefined // Unique key for credit
        });
        await creditTx.save();

        res.json({ message: 'Money sent successfully' });

    } catch (err) {
        // Handle Duplicate Key Error (Race condition/Idempotency fallback)
        if (err.code === 11000) {
            console.log("Duplicate key error during transaction, treating as success/idempotent");
            return res.status(200).json({ message: 'Transaction already processed' });
        }

        console.error("Transaction Error:", err);
        res.status(500).json({ message: 'Server error: Transaction failed' });
    }
});

module.exports = router;
