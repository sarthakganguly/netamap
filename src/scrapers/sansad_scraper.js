const https = require('https');
const db = require('../db/connection');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://sansad.in/ls/members',
  'Origin': 'https://sansad.in'
};

async function fetchData(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await new Promise((resolve, reject) => {
        https.get(url, { headers: HEADERS }, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Failed to parse JSON from ${url}`));
            }
          });
        }).on('error', reject);
      });
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Retry ${i + 1}/${retries} for ${url}...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function fetchImageBase64(mpsno) {
  const url = `https://sansad.in/getFile/mpimage/photo/${mpsno}.jpg?source=loksabhadocs`;
  return new Promise((resolve) => {
    https.get(url, { headers: HEADERS }, (res) => {
      if (res.statusCode !== 200) {
        resolve(null);
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer.toString('base64'));
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  console.log('Starting Full Sync with Image Extraction...');

  // 1. Sync Parties
  console.log('Syncing Parties...');
  const parties = await fetchData('https://sansad.in/api_ls/member/partyWiseRepresentation?loksabha=18');
  const partyStmt = db.prepare('INSERT OR REPLACE INTO parties (partySname, partyFname, partyName, count) VALUES (?, ?, ?, ?)');
  for (const p of parties) {
    partyStmt.run(p.partySname, p.partyFname, p.partyName, p.count);
  }
  partyStmt.finalize();
  console.log(`Synced ${parties.length} parties.`);

  // 2. Sync Parliamentary Terms
  console.log('Syncing Parliamentary Terms...');
  const termsData = await fetchData('https://sansad.in/cms/ls-pp/api/about-parliamentary-terms?locale=en&populate=parliTerms&pagination[limit]=1000');
  const termStmt = db.prepare('INSERT OR REPLACE INTO parliamentary_terms (term_id, title, description, letter) VALUES (?, ?, ?, ?)');
  for (const entry of termsData.data) {
    const letter = entry.attributes.letter;
    const terms = entry.attributes.parliTerms || [];
    for (const t of terms) {
      termStmt.run(t.id, t.title, t.description, letter);
    }
  }
  termStmt.finalize();
  console.log('Synced Parliamentary Terms.');

  // 3. Sync Members
  console.log('Fetching Member List...');
  const memberListData = await fetchData('https://sansad.in/api_ls/member?loksabha=18&sitting=1');
  const memberList = memberListData.membersDtoList;
  console.log(`Found ${memberList.length} members. Starting deep scrape + image encoding...`);

  const memberStmt = db.prepare(`INSERT OR REPLACE INTO members (
    mpsno, initial, firstName, lastName, fullName, gender, partyFname, partySname, 
    constituency, stateName, stateCode, status, lastLoksabha, lsExpr, noOfTerms, 
    age, dob, birthPlace, fatherName, motherName, spouseName, marriageDate, 
    maritalStatus, numberOfSons, numberOfDaughters, qualification, education, 
    mainProfession, otherProfession, email, personalPhone, delhiPhone, 
    presentAddress, permanentAddress, permanentLaddr, photoUrl, image, facebook, 
    twitter, instagram, pinterest, linkedIn, booksPublished, literary, 
    social, interest, hobbies, sports, countriesVisited, otherInfo, freedom, 
    icNo, pan_number, createdAt, updatedAt
  ) VALUES (${new Array(55).fill('?').join(',')})`);

  let count = 0;
  const batchSize = 5;
  for (let i = 0; i < memberList.length; i += batchSize) {
    const batch = memberList.slice(i, i + batchSize);
    await Promise.all(batch.map(async (m) => {
      try {
        const [profile, imageBase64] = await Promise.all([
          fetchData(`https://sansad.in/api_ls/member/${m.mpsno}`),
          fetchImageBase64(m.mpsno)
        ]);
        
        memberStmt.run(
          m.mpsno, m.initial, m.firstName, m.lastName,
          profile.fullName || m.mpFirstLastName, m.gender, m.partyFname, m.partySname,
          profile.constituency || m.constName, profile.stateName || m.stateName, profile.stateCode,
          m.status, m.lastLoksabha, m.lsExpr, m.noOfTerms, m.age,
          profile.dateOfBirth || m.dob, profile.birthPlace, profile.fatherName, profile.motherName,
          profile.spouseName, profile.marriageDate, profile.maritalStatus || m.maritalStatus,
          m.numberOfSons, m.numberOfDaughters, profile.qualificationName || m.qualification,
          profile.education, profile.mainProfessionName || m.profession, profile.otherProfessionName || m.profession2,
          profile.email || (m.email ? m.email.join(', ') : ''),
          profile.personalPhone || m.personalPhone, profile.delhiPhone || m.delhiPhone,
          (profile.presentFaddr || '') + ' ' + (profile.presentLaddr || ''),
          profile.permanentFaddr, profile.permanentLaddr || m.permanentLaddr,
          profile.photoUrl || m.imageUrl,
          imageBase64,
          profile.facebook, profile.twitter, profile.instagram, profile.pinterest, profile.linkedIn,
          profile.booksPublished, profile.literary, profile.social, profile.interest, profile.hobbies,
          profile.sports, profile.countriesVisited, profile.otherInfo,
          m.freedom, profile.icNo, null, m.createdAt, m.updatedAt
        );
        count++;
        if (count % 50 === 0) console.log(`Processed ${count}/${memberList.length} members...`);
      } catch (err) {
        console.error(`Error fetching profile/image for ${m.mpsno}:`, err.message);
      }
    }));
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  memberStmt.finalize();
  console.log(`Full Sync Complete! Total members saved: ${count}`);
  db.close();
}

run().catch(err => {
  console.error('Fatal Error:', err);
  db.close();
});
