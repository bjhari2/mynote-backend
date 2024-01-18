const express = require('express')
const router = express.Router()
const fetchuser = require('../middlewares/fetchUser')
const { body, matchedData, validationResult } = require('express-validator');
const Notes = require('../models/Notes')

// ROUTE 1: Get all the notes using: GET "/api/notes/fetchallnotes". login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 2: Add notes of the user using: POST "/api/notes/addnote". login required
router.post('/addnote', fetchuser, [
    body("title", 'Enter a valid title').isLength({ min: 3 }),
    body("description", "Enter a description of atleast 5 characters").isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        // Creating new notes object and saving the note
        const note = new Notes({
            title, description, tag, user: req.user.id
        });
        const savedNote = await note.save();
        res.send(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 3: Update note of the user using: PUT "/api/notes/updatenote/:id". login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        // Create a newNote object to store updated contents
        let newNote = {};
        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        // Check if the note exists
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not found") }

        // Check if the user is not updating other's notes
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed")
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 4: Delete note of the user using: DELEtE "/api/notes/deletenote/:id". login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Check if the note exists
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not found") }

        // Check if the user is not deleting other's notes
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed")
        }

        note = await Notes.findByIdAndDelete(req.params.id)

        res.json({ "Success": "Note has been deleted", note: note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})



module.exports = router

