// File @desc: Board (Kanban Page) APIs
// - GET    /api/v1/boards/:id          → Get full board (lists, cards, members)
// - GET    /api/v1/boards/:id/audit    → Get all audit logs for board
// - POST   /api/v1/boards/:id/members  → Add member to board (search by email)
// - GET    /api/v1/users/search        → Search platform users by name/email

const express = require("express");
const zod = require("zod");
const authMiddleware = require("../middleware/authMiddleware.js");

const Board = require("../models/Board.js");
const List = require("../models/List.js");
const Card = require("../models/Card.js");
const User = require("../models/User.js");
const AuditLog = require("../models/AuditLog.js");

const router = express.Router();


// ----------------- ROUTES -----------------

// @route   GET /api/v1/boards/:id
// @desc    Get full board (lists, cards, members with name)
router.get("/boards/:id", authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate("owner", "name email profilePic")
      .populate("members.user", "name email profilePic");

    if (!board) return res.status(404).json({ msg: "Board not found" });

    // Flatten members → { _id, name, email, profilePic, role }
    const formattedMembers = board.members.map(m => ({
      _id: m.user._id,
      name: m.user.name,
      email: m.user.email,
      profilePic: m.user.profilePic,
      role: m.role
    }));

    // Populate lists + cards
    const lists = await List.find({ boardId: board._id }).sort({ position: 1 });
    const listsWithCards = await Promise.all(
      lists.map(async (list) => {
        const cards = await Card.find({ listId: list._id })
          .sort({ position: 1 })
          .populate("assignedUsers", "name email profilePic")
          .populate("comments.user", "name email profilePic");
        return { ...list.toObject(), cards };
      })
    );

    res.json({
      ...board.toObject(),
      members: formattedMembers, // overwrite with clean format
      lists: listsWithCards
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// @route   /api/v1/boards/:id/audit
// @desc    Get all audit logs for board
router.get("/boards/:id/audit", authMiddleware, async (req, res) => {
  try {
    const logs = await AuditLog.find({ boardId: req.params.id })
      .populate("user", "name email profilePic")
      .sort({ timestamp: -1 });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// @route   /api/v1/boards/:id/members
// @desc    Add member to board (search by email)
router.post("/boards/:id/members", authMiddleware, async (req, res) => {
  try {

    const { email } = req.body;
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ msg: "User not found" });

    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ msg: "Board not found" });

    // Only owner or admin can add
    const isAdmin = board.owner.toString() === req.userId || board.members.some(m => m.user.toString() === req.userId && m.role === "Admin");
    if (!isAdmin) return res.status(403).json({ msg: "Not authorized to add members" });

    // Check if already a member
    if (board.members.some(m => m.user.toString() === userToAdd._id.toString()))
      return res.status(400).json({ msg: "User already a member" });

    board.members.push({ user: userToAdd._id, role: "Member" });
    await board.save();

    // Audit log
    await AuditLog.create({
      action: "MEMBER_ADDED",
      user: req.userId,
      userName: req.userName,
      boardId: board._id,
      targetId: userToAdd._id,
      details: { email: userToAdd.email }
    });

    res.json({ msg: "Member added", board });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});



// @route   /api/v1/users/search
// @desc    Search platform users by name/email
router.get("/users/search", authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") return res.status(400).json({ msg: "Query is required" });

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).select("name email profilePic");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
