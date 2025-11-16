const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  listId: { type: mongoose.Schema.Types.ObjectId, ref: "List" },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },
  position: { type: Number, default: 0 },
  dueDate: { type: Date },
  labels: [String],
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Card",CardSchema);