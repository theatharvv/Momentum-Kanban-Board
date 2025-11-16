const express = require("express");

const authMiddleware = require("../middleware/authMiddleware.js");
const Board = require("../models/Board.js");
const List = require("../models/List.js");
const User = require("../models/User.js");
const Card = require("../models/Card.js");
const AuditLog = require("../models/AuditLog.js");

const router = express.Router();

// File @desc:
// - `GET /api/v1/boards/my` → Get boards created by me
// - `GET /api/v1/boards/shared` → Get boards shared with me
// - `POST /api/v1/boards` → Create board (returns board + default lists created: Todo, Ongoing, Done)
// - `DELETE /api/v1/boards/:id` → Delete board (only Admin can do this)

// - `GET /api/v1/profile/me` → Get my profile info (name, email, pic)
// - `PUT /api/v1/profile/me` → Update profile (name, pfp, email)
// - `GET /api/v1/audit/recent` → Get **2 recent activities per board** (for dashboard preview)


// @route   GET /api/v1/boards/my
// @desc    Get boards created by me
router.get("/boards/my", authMiddleware, async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.userId }).populate("members.user", "name email profilePic");
    res.json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// @route   GET /api/v1/boards/shared
// @desc    Get boards shared with me (exclude boards I own)
router.get("/boards/shared", authMiddleware, async (req, res) => {
  try {
    const boards = await Board.find({
      "members.user": req.userId,     // must be in members
      owner: { $ne: req.userId }      // exclude if I'm the owner
    }).populate("members.user", "name email profilePic");

    res.json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// @route   POST /api/v1/boards
// @desc    Create board (returns board + default lists created: Todo, Ongoing, Done)
router.post("/boards", authMiddleware, async (req, res) => {
  try {
    const { title, background } = req.body;

    // 1. Create board
    const board = new Board({
      title,
      background: background || "default",
      owner: req.userId,
      members: [{ user: req.userId, role: "Admin" }],
    });

    await board.save();

    // 2. Create default lists
    const defaultLists = ["To Do", "On Going", "Done"];
    const lists = await Promise.all(
      defaultLists.map((title, index) =>
        new List({ title, boardId: board._id, position: index }).save()
      )
    );

    // 3. Add Audit log
    await AuditLog.create({
      action: "BOARD_CREATED",
      user: req.userId,
      userName: req.userName,
      boardId: board._id,
      targetId: board._id,
      details: { title: board.title },
    });

    res.status(201).json({ board, lists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// @route   DELETE /api/v1/boards/:id
// @desc    Delete board (only Admin/Owner + cascade delete lists & cards)
router.delete("/boards/:id", authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ msg: "Board not found" });

    // check permissions
    if (board.owner.toString() !== req.userId) {
      const member = board.members.find(
        m => m.user.toString() === req.userId && m.role === "Admin"
      );
      if (!member) return res.status(403).json({ msg: "Not authorized" });
    }

    // Delete all cards of this board
    await Card.deleteMany({ boardId: board._id });

    // Delete all lists of this board
    await List.deleteMany({ boardId: board._id });

    // Finally, delete the board itself
    await board.deleteOne();

    // Log the deletion
    await AuditLog.create({
      action: "BOARD_DELETED",
      user: req.userId,
      userName: req.userName,
      boardId: req.params.id,
      targetId: req.params.id,
      details: { title: board.title },
    });

    res.json({ msg: "Board and its lists/cards deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// @route   GET /api/v1/profile/me
// @desc    Get my profile info
router.get("/profile/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("name email profilePic");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// @route   PUT /api/v1/profile/me
// @desc    Update my profile
router.put("/profile/me", authMiddleware, async (req, res) => {
  try {
    const { name, email, profilePic } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email, profilePic },
      { new: true }
    ).select("name email profilePic");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// @route   GET /api/v1/audit/recent
// @desc    Get 2 recent activities per board
router.get("/audit/recent", authMiddleware, async (req, res) => {
  try {
    // 1. Find all boards user is part of
    const boards = await Board.find({
      $or: [
        { owner: req.userId },
        { "members.user": req.userId }
      ]
    });

    // 2. Fetch 2 recent logs per board
    const logs = {};
    for (const board of boards) {
      logs[board._id] = await AuditLog.find({ boardId: board._id })
        .sort({ timestamp: -1 })
        .limit(2)
        .populate("user", "name email profilePic");
    }

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
