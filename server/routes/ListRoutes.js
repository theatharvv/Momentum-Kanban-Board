const express = require("express");
const zod = require("zod");
const authMiddleware = require("../middleware/authMiddleware.js"); // JWT middleware
const List = require("../models/List.js");
const Card = require("../models/Card.js");
const AuditLog = require("../models/AuditLog.js");

const router = express.Router();

// File @desc:
// - `POST /api/v1/lists` → Create new list (boardId, title)
// - `PUT /api/v1/lists/:id` → Update title / set WIP limit
// - `DELETE /api/v1/lists/:id` → Delete list (cascade delete cards)


// Validation Schemas
const createListSchema = zod.object({
    boardId: zod.string(),
    title: zod.string().min(1, "Title cannot be empty"),
});

const updateListSchema = zod.object({
    title: zod.string().optional(),
    wipLimit: zod.number().int().positive().optional(),
});


// @route   POST /api/v1/lists
// @desc    Create new list (boardId, title)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { boardId, title } = req.body;

        // Validate input
        const parsed = createListSchema.safeParse({ boardId, title });
        if (!parsed.success)
            return res.status(400).json({ msg: "Invalid Input", error: parsed.error.errors });

        // Create new list
        const newList = new List({ boardId, title });
        await newList.save();

        // Write to AuditLog
        await AuditLog.create({
            action: "LIST_CREATED",
            user: req.userId,
            userName: req.userName,
            boardId: boardId,
            targetId: newList._id,
            details: { title: newList.title },
        });

        res.status(201).json(newList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


// @route   PUT /api/v1/lists/:id
// @desc    Update list title / WIP limit
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, wipLimit } = req.body;

        // Validate input
        const parsed = updateListSchema.safeParse({ title, wipLimit });
        if (!parsed.success)
            return res.status(400).json({ msg: "Invalid Input", error: parsed.error.errors });

        // Update list
        const updatedList = await List.findByIdAndUpdate(
            id,
            { $set: { ...(title && { title }), ...(wipLimit !== undefined && { wipLimit }) } },
            { new: true }
        );

        if (!updatedList) return res.status(404).json({ msg: "List not found" });

        // Write to AuditLog
        await AuditLog.create({
            action: "LIST_UPDATED",
            user: req.userId,
            userName: req.userName,
            boardId: updatedList.boardId,
            targetId: updatedList._id,
            details: { title: updatedList.title, wipLimit: updatedList.wipLimit },
        });

        res.json(updatedList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


// @route   DELETE /api/v1/lists/:id
// @desc    Delete list (cascade delete cards)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const list = await List.findById(id);
        if (!list) return res.status(404).json({ msg: "List not found" });

        // Cascade delete cards under this list
        await Card.deleteMany({ listId: id });
        await list.deleteOne();

        // Write to AuditLog
        await AuditLog.create({
            action: "LIST_DELETED",
            user: req.userId,
            userName: req.userName,
            boardId: list.boardId,
            targetId: list._id,
            details: { title: list.title },
        });

        res.json({ msg: "List and its cards deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
