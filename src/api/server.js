const express = require('express');
const db = require('../db/connection');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

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

// ECI Candidates List
app.get('/api/eci/candidates', (req, res) => {
  db.all('SELECT id, name_en, party_name_en, state, assembly_constituency, current_status FROM eci_candidates', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ECI Candidate Detail + Parsed Affidavit
app.get('/api/eci/candidates/:id', (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT c.*, a.raw_json as affidavit_json 
    FROM eci_candidates c
    LEFT JOIN eci_affidavits a ON c.id = a.candidate_id
    WHERE c.id = ?
  `;
  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Candidate not found' });
    
    // Parse the raw_json if it exists
    if (row.affidavit_json) {
      try {
        row.affidavit_data = JSON.parse(row.affidavit_json);
        delete row.affidavit_json;
      } catch (e) {
        row.affidavit_data = null;
      }
    }
    res.json(row);
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
