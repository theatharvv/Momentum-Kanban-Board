const express = require("express");
const zod = require("zod");
const authMiddleware = require("../middleware/authMiddleware.js"); 
const Card = require("../models/Card.js");
const List = require("../models/List.js");
const AuditLog = require("../models/AuditLog.js");

const router = express.Router();

// File @desc:
// - `POST /api/v1/cards` → Create card in list
// - `PUT /api/v1/cards/:id` → Update card (title, desc, due date, labels)
// - `DELETE /api/v1/cards/:id` → Delete card
// - `PUT /api/v1/cards/:id/move` → Move card to another list (update listId + position)
// - `POST /api/v1/cards/:id/comment` → Add comment
// - `PUT /api/v1/cards/:id/assign` → Assign members


// Validation Schemas
const createCardSchema = zod.object({
    listId: zod.string(),
    title: zod.string().min(1, "Title cannot be empty"),
    description: zod.string().optional(),
    dueDate: zod.string().optional(),
    labels: zod.array(zod.string()).optional(),
});

const updateCardSchema = zod.object({
    title: zod.string().optional(),
    description: zod.string().optional(),
    dueDate: zod.string().datetime().optional(),
    labels: zod.array(zod.string()).optional(),
    listId: zod.string().optional(), // ADD THIS LINE
});

const moveCardSchema = zod.object({
    targetListId: zod.string(),
    position: zod.number().int().nonnegative(),
});

const addCommentSchema = zod.object({
    text: zod.string().min(1, "Comment cannot be empty"),
});

const assignMemberSchema = zod.object({
    memberId: zod.string(),
});


// @route   POST /api/v1/cards
// @desc    Create card in list
router.post("/", authMiddleware, async (req, res) => {
    try {
        
        const parsed = createCardSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ msg: "Invalid Input", error: parsed.error.errors });

        const { listId, title, description, dueDate, labels } = parsed.data;
        const board = req.body.board;

        // Make sure labels is included when creating the card
        const card = new Card({ 
            listId, 
            title, 
            description, 
            dueDate, 
            labels: labels || [] // Ensure labels defaults to empty array if undefined
        });
        
        await card.save();

        await AuditLog.create({
            action: "CARD_CREATED",
            user: req.userId,
            userName: req.userName,
            boardId: board._id,
            targetId: board._id,
            details: { title: board.title, cardId: card._id, listId }
        });

        res.status(201).json(card);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


// @route   PUT /api/v1/cards/:id
// @desc    Update card (title, desc, due date, labels)
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const parsed = updateCardSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ msg: "Invalid Input", error: parsed.error.errors });

        const card = await Card.findByIdAndUpdate(
            req.params.id,
            { $set: parsed.data },
            { new: true }
        );

        if (!card) return res.status(404).json({ msg: "Card not found" });

        await AuditLog.create({
            action: "CARD_UPDATED",
            user: req.userId,
            userName: req.userName,
            details: { cardId: card._id }
        });

        res.json(card);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


// @route   DELETE /api/v1/cards/:id
// @desc    Delete card
router.delete("/:id", authMiddleware, async (req, res) => {
    try {

        const board = JSON.parse(req.query.board);
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).json({ msg: "Card not found" });

        await AuditLog.create({
            action: "CARD_DELETED",
            user: req.userId,
            userName: req.userName,
            boardId: board._id,
            targetId: board._id,
            details: { title: board.title, cardId: req.params.id }
        });

        await card.deleteOne();
        
        res.json({ msg: "Card deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


// @route   PUT /api/v1/cards/:id/move
// @desc    Move card to another list (update listId + position)
router.put("/:id/move", authMiddleware, async (req, res) => {
    try {
        const parsed = moveCardSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ msg: "Invalid Input", error: parsed.error.errors });

        const { targetListId, position } = parsed.data;

        const card = await Card.findByIdAndUpdate(
            req.params.id,
            { $set: { listId: targetListId, position } },
            { new: true }
        );

        if (!card) return res.status(404).json({ msg: "Card not found" });

        await AuditLog.create({
            action: "CARD_MOVED",
            user: req.userId,
            userName: req.userName,
            details: { cardId: card._id, targetListId, position }
        });

        res.json(card);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


// @route   POST /api/v1/cards/:id/comment
// @desc    Add comment
router.post("/:id/comment", authMiddleware, async (req, res) => {
    try {
        const parsed = addCommentSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ msg: "Invalid Input", error: parsed.error.errors });

        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).json({ msg: "Card not found" });

        const comment = {
            user: req.userId,
            text: parsed.data.text,
            createdAt: new Date()
        };

        card.comments.push(comment);
        await card.save();

        await AuditLog.create({
            action: "COMMENT_ADDED",
            user: req.userId,
            userName: req.userName,
            details: { cardId: card._id, comment }
        });

        res.status(201).json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


// @route   PUT /api/v1/cards/:id/assign
// @desc    Assign members
router.put("/:id/assign", authMiddleware, async (req, res) => {
    try {
        const parsed = assignMemberSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ msg: "Invalid Input", error: parsed.error.errors });

        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).json({ msg: "Card not found" });

        if (!card.assignedUsers.includes(parsed.data.memberId)) {
            card.assignedUsers.push(parsed.data.memberId);
            await card.save();
        }
        
        await AuditLog.create({
            action: "CARD_ASSIGNED",
            user: req.userId,
            userName: req.userName,
            details: { cardId: card._id, memberId: parsed.data.memberId }
        });

        res.json(card);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
