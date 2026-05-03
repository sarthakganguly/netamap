const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const db = new sqlite3.Database('sansad.db');

app.use(cors());
app.use(express.json());

// Search endpoint - returns compact data
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.json([]);
  }

  const sql = `
    SELECT mpsno, fullName, partySname, constituency, stateName, photoUrl, image
    FROM members 
    WHERE fullName LIKE ? OR constituency LIKE ?
    LIMIT 20
  `;
  const params = [`%${query}%`, `%${query}%`];

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Detailed profile endpoint - returns full data including Base64 image
app.get('/api/members/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM members WHERE mpsno = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(row);
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
