const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
    {
        TID: { type: String },
        ACQ: { type: String },
        BIN: { type: String }, // Assuming BIN might exceed JavaScript's Number precision.
        Vreme: { type: Date },
        Timestamp_created: { type: Date, default: Date.now },
        Timestamp_received: { type: Date },
        Status: { type: String }, // Add valid statuses as needed.
        Brand: { type: String },
        HostResponse: { type: String },
        TerminalResponse: { type: String },
        MasterCount: { type: Number, default: 0 },
        DinaCount: { type: Number, default: 0 },
        VisaCount: { type: Number, default: 0 },
        Banka: { type: String }
    },
    { timestamps: true } // Adds `createdAt` and `updatedAt` fields automatically.
);

module.exports = mongoose.model('Transaction', transactionSchema);
