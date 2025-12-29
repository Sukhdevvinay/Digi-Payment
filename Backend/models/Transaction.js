const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    },
    idempotencyKey: {
        type: String,
        unique: true,
        sparse: true
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
