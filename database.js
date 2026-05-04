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

  // 4. ECI Candidate Profiles (from DOM)
  db.run(`CREATE TABLE IF NOT EXISTS eci_candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state TEXT,
    assembly_constituency TEXT,
    party_name_en TEXT,
    party_name_local TEXT,
    application_uploaded_date TEXT,
    current_status TEXT,
    name_en TEXT,
    name_local TEXT,
    relative_name_en TEXT,
    relative_name_local TEXT,
    gender TEXT,
    age INTEGER,
    address TEXT,
    profile_image_url TEXT,
    uploaded_on TEXT,
    download_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 5. ECI Affidavits (from Form 26 PDF)
  db.run(`CREATE TABLE IF NOT EXISTS eci_affidavits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER,
    date_of_filing TEXT,
    notary_name TEXT,
    notary_reg_no TEXT,
    notary_valid_upto TEXT,
    house_name TEXT,
    constituency_number INTEGER,
    constituency_name TEXT,
    party_affiliation TEXT,
    full_name TEXT,
    relative_type TEXT,
    relative_name TEXT,
    candidate_age INTEGER,
    candidate_address TEXT,
    mobile TEXT,
    email TEXT,
    social_media TEXT,
    electoral_roll_state TEXT,
    electoral_roll_serial INTEGER,
    electoral_roll_part INTEGER,
    pan_number TEXT,
    last_return_filed_year TEXT,
    total_income_shown TEXT,
    pending_criminal_cases BOOLEAN,
    convictions BOOLEAN,
    movable_assets_total REAL,
    immovable_assets_total REAL,
    liabilities_total REAL,
    highest_qualification TEXT,
    year_completed INTEGER,
    institution TEXT,
    board_university TEXT,
    raw_json TEXT,
    FOREIGN KEY(candidate_id) REFERENCES eci_candidates(id)
  )`);
});

db.close();
console.log('Database initialized: sansad.db');
