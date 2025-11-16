const mongoose = require("mongoose");

const BoardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  background: { type: String, default: "default" }, // color or image
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["Admin", "Member", "Viewer"], default: "Member" }
  }],
}, { timestamps: true });

module.exports = mongoose.model("Board",BoardSchema);