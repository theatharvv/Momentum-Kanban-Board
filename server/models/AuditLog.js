const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // CARD_CREATED, LIST_DELETED etc
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: { type: String },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // card/list/board id
  details: { type: Object }, // flexible JSON
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AuditLog", AuditLogSchema);