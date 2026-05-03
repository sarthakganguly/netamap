const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('sansad.db');

db.serialize(() => {
  // 1. Parties Table
  db.run(`CREATE TABLE IF NOT EXISTS parties (
    partySname TEXT PRIMARY KEY,
    partyFname TEXT,
    partyName TEXT,
    count INTEGER
  )`);

  // 2. Members Table (Exhaustive)
  db.run(`CREATE TABLE IF NOT EXISTS members (
    mpsno INTEGER PRIMARY KEY,
    initial TEXT,
    firstName TEXT,
    lastName TEXT,
    fullName TEXT,
    gender TEXT,
    partyFname TEXT,
    partySname TEXT,
    constituency TEXT,
    stateName TEXT,
    stateCode TEXT,
    status TEXT,
    lastLoksabha INTEGER,
    lsExpr TEXT,
    noOfTerms INTEGER,
    age INTEGER,
    dob TEXT,
    birthPlace TEXT,
    fatherName TEXT,
    motherName TEXT,
    spouseName TEXT,
    marriageDate TEXT,
    maritalStatus TEXT,
    numberOfSons INTEGER,
    numberOfDaughters INTEGER,
    qualification TEXT,
    education TEXT,
    mainProfession TEXT,
    otherProfession TEXT,
    email TEXT,
    personalPhone TEXT,
    delhiPhone TEXT,
    presentAddress TEXT,
    permanentAddress TEXT,
    permanentLaddr TEXT,
    photoUrl TEXT,
    image TEXT,
    facebook TEXT,
    twitter TEXT,
    instagram TEXT,
    pinterest TEXT,
    linkedIn TEXT,
    booksPublished TEXT,
    literary TEXT,
    social TEXT,
    interest TEXT,
    hobbies TEXT,
    sports TEXT,
    countriesVisited TEXT,
    otherInfo TEXT,
    freedom TEXT,
    icNo INTEGER,
    pan_number TEXT,
    createdAt TEXT,
    updatedAt TEXT
  )`);

  // 3. Parliamentary Terms Table
  db.run(`CREATE TABLE IF NOT EXISTS parliamentary_terms (
    term_id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT,
    letter TEXT
  )`);
});

db.close();
console.log('Database initialized: sansad.db');
