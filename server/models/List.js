const mongoose = require("mongoose");

const ListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },
  position: { type: Number, default: 0 },
  wipLimit: { type: Number, default: 2 }, // work-in-progress limit
}, { timestamps: true });

module.exports = mongoose.model("List",ListSchema);