const express = require('express');
const pool = require('../db');
const router = express.Router();
require('dotenv').config();


// SEARCH ROUTE (Vulnerable to SQL Injection)
router.get('/search-books', async (req, res) => {
    // We get the search term from the URL query: /search-books?title=...
    const { title } = req.query;

    try {
        const queryText = `SELECT * FROM books WHERE title LIKE '%${title}%'`;

        console.log("Executing SQL:", queryText);

        const result = await pool.query(queryText);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No books found." });
        }

        return res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send(`Database Error: ${err.message}`);
    }
});

module.exports = router;