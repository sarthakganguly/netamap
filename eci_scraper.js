const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { createWorker } = require('tesseract.js');
const { execSync } = require('child_process');

const DB_PATH = 'sansad.db';
const DOWNLOAD_PATH = path.resolve(__dirname, 'downloads');

if (!fs.existsSync(DOWNLOAD_PATH)) {
  fs.mkdirSync(DOWNLOAD_PATH);
}

const db = new sqlite3.Database(DB_PATH);

// Initialize Tables
db.serialize(() => {
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

function extractRegex(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

async function parseForm26(pdfPath) {
  console.log(`  [OCR] Converting PDF to images: ${path.basename(pdfPath)}`);
  const tempDir = path.join(DOWNLOAD_PATH, 'temp_pages');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  try {
    // Convert PDF to 300 DPI JPEGs
    execSync(`pdftoppm -jpeg -r 300 "${pdfPath}" "${tempDir}/page"`);
    
    const imageFiles = fs.readdirSync(tempDir).filter(f => f.startsWith('page') && f.endsWith('.jpg')).sort();
    console.log(`  [OCR] Found ${imageFiles.length} pages. Starting text extraction...`);

    const worker = await createWorker('eng');
    let fullText = '';

    for (const img of imageFiles) {
      const imgPath = path.join(tempDir, img);
      console.log(`  [OCR] Processing ${img}...`);
      const { data: { text } } = await worker.recognize(imgPath);
      fullText += text + '\n';
      fs.unlinkSync(imgPath);
    }

    await worker.terminate();
    fs.rmdirSync(tempDir);

    console.log('  [OCR] Text extraction complete. Mapping to schema...');
    return mapTextToSchema(fullText);
  } catch (err) {
    console.error(`  [OCR-ERROR] ${err.message}`);
    throw err;
  }
}

function mapTextToSchema(text) {
  return {
    document_metadata: {
      form_type: "Form 26",
      date_of_filing: extractRegex(text, /Date of filing:\s*(\d{2}[/-]\d{2}[/-]\d{4})/i),
      notary_details: {
        name: extractRegex(text, /Notary Name:\s*(.*)/i),
        registration_number: extractRegex(text, /Reg\.?\s*No\.?\s*(.*)/i),
        valid_upto: extractRegex(text, /Valid\s*upto\s*(\d{2}[/-]\d{2}[/-]\d{4})/i)
      }
    },
    election_details: {
      house_name: extractRegex(text, /Election to the\s*(.*)/i),
      constituency_number: parseInt(extractRegex(text, /Constituency\s*No\.?\s*(\d+)/i)),
      constituency_name: extractRegex(text, /Constituency\s*(?:Name)?\s*[:\-\s]+(.*)/i),
      party_affiliation: extractRegex(text, /Party\s*Affiliation\s*[:\-\s]+(.*)/i)
    },
    candidate_details: {
      full_name: extractRegex(text, /I,\s*([^,]*)/i),
      relative_type: text.toLowerCase().includes('son of') ? 'son' : (text.toLowerCase().includes('wife of') ? 'wife' : 'daughter'),
      relative_name: extractRegex(text, /(?:son|daughter|wife)\s*of\s*(.*)/i),
      age: parseInt(extractRegex(text, /aged\s*(\d+)/i)),
      address: {
        village_po: extractRegex(text, /resident of\s*(.*)/i),
        district: extractRegex(text, /District\s*[:\-\s]+(.*)/i),
        state: extractRegex(text, /State\s*[:\-\s]+(.*)/i),
        pincode: extractRegex(text, /Pin\s*Code\s*[:\-\s]+(\d{6})/i)
      },
      contact_info: {
        mobile: extractRegex(text, /Mobile\s*No\.?\s*[:\-\s]+(\d{10})/i),
        email: extractRegex(text, /Email\s*ID\s*[:\-\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
      },
      tax_details: {
        pan_number: extractRegex(text, /PAN\s*number\s*is\s*([A-Z0-9]{10})/i),
        last_return_filed_year: extractRegex(text, /last\s*Income-tax\s*return\s*filed\s*for\s*the\s*financial\s*year\s*(\d{4}-\d{2,4})/i),
        total_income_shown: extractRegex(text, /Total\s*income\s*shown\s*in\s*Income-tax\s*return\s*Rs\.?\s*([\d,.]+)/i)
      }
    },
    legal_records: {
      pending_criminal_cases: text.toLowerCase().includes('pending criminal cases') && !text.toLowerCase().includes('not pending'),
      convictions: text.toLowerCase().includes('convicted') && !text.toLowerCase().includes('not convicted')
    },
    financial_declarations: {
      assets: {
        movable: {
          cash_in_hand: parseFloat(extractRegex(text, /Cash\s*in\s*hand\s*Rs\.?\s*([\d,.]+)/i)?.replace(/,/g, '')),
          gross_total_value: parseFloat(extractRegex(text, /Gross\s*Total\s*Value\s*Rs\.?\s*([\d,.]+)/i)?.replace(/,/g, ''))
        },
        immovable: {
          total_value: parseFloat(extractRegex(text, /Current\s*market\s*value\s*of\s*immovable\s*property\s*Rs\.?\s*([\d,.]+)/i)?.replace(/,/g, ''))
        }
      },
      liabilities: {
        bank_dues: parseFloat(extractRegex(text, /Loans\s*from\s*Bank\s*Rs\.?\s*([\d,.]+)/i)?.replace(/,/g, ''))
      }
    },
    education: {
      highest_qualification: extractRegex(text, /Highest\s*educational\s*qualification\s*[:\-\s]+(.*)/i),
      institution: extractRegex(text, /Name\s*of\s*School\s*\/\s*University\s*[:\-\s]+(.*)/i)
    }
  };
}

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOAD_PATH });

  console.log(`[${new Date().toLocaleTimeString()}] Navigating to ECI Affidavit Portal...`);
  await page.goto('https://affidavit.eci.gov.in/candidate-affidavit', { waitUntil: 'networkidle2', timeout: 90000 });

  await new Promise(r => setTimeout(r, 5000)); 

  console.log(`[${new Date().toLocaleTimeString()}] Searching for candidates...`);
  const candidates = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a')).filter(a => 
      a.innerText.toLowerCase().includes('view more') || a.href.includes('candidate-profile')
    );

    return links.map(a => {
      const container = a.closest('tr, .card, .candidate-card');
      return {
        name_brief: container?.innerText.split('\n')[0].trim() || 'Candidate',
        profile_url: a.href
      };
    }).filter((v, i, a) => a.findIndex(t => t.profile_url === v.profile_url) === i).slice(0, 3);
  });

  console.log(`[${new Date().toLocaleTimeString()}] Found ${candidates.length} candidates. Starting detailed scrape...`);

  for (const candidate of candidates) {
    console.log(`\n--- Candidate: ${candidate.name_brief} ---`);
    console.log(`[${new Date().toLocaleTimeString()}] Navigating to profile: ${candidate.profile_url}`);
    await page.goto(candidate.profile_url, { waitUntil: 'networkidle2' });

    const profileData = await page.evaluate(() => {
      const getVal = (label) => {
        const rows = Array.from(document.querySelectorAll('tr, .row, div'));
        const row = rows.find(r => r.innerText.includes(label));
        return row?.innerText.replace(label, '').replace(':', '').trim() || null;
      };

      return {
        state: getVal('State Name') || getVal('State'),
        constituency: getVal('Constituency Name') || getVal('Constituency'),
        party: getVal('Party Name') || getVal('Party'),
        status: getVal('Status'),
        name: document.querySelector('h3, h4, .candidate-name')?.innerText.trim(),
        age: parseInt(getVal('Age')) || null,
        address: getVal('Address'),
        img: document.querySelector('img[src*="photo"], .candidate-image img')?.src
      };
    });

    console.log(`[${new Date().toLocaleTimeString()}] Extracted Profile: ${profileData.name} (${profileData.party})`);

    const candidateId = await new Promise((resolve) => {
      db.run(`INSERT INTO eci_candidates (
        state, assembly_constituency, party_name_en, current_status, 
        name_en, age, address, profile_image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        profileData.state, profileData.constituency, profileData.party, profileData.status,
        profileData.name, profileData.age, profileData.address, profileData.img
      ], function() { resolve(this.lastID); });
    });

    console.log(`[${new Date().toLocaleTimeString()}] Searching for Affidavit Download button...`);
    // Improved selector to catch both <a> and <button> variations
    const downloadLink = await page.evaluateHandle(() => {
      const elements = Array.from(document.querySelectorAll('a, button'));
      return elements.find(el => 
        el.innerText.toLowerCase().includes('download') || 
        el.getAttribute('onclick')?.includes('increaseDownloadCount')
      );
    });
    
    if (downloadLink && (await downloadLink.asElement())) {
      console.log(`[${new Date().toLocaleTimeString()}] Download button found. Initiating PDF download...`);
      await downloadLink.asElement().click();
      
      let pdfFile = null;
      console.log(`[${new Date().toLocaleTimeString()}] Waiting for PDF to appear in downloads folder...`);
      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise(r => setTimeout(r, 1000));
        const files = fs.readdirSync(DOWNLOAD_PATH);
        pdfFile = files.find(f => f.endsWith('.pdf'));
        if (pdfFile) break;
        if (attempt % 5 === 0 && attempt > 0) console.log(`[${new Date().toLocaleTimeString()}] Still waiting for download... (${attempt}s elapsed)`);
      }

      if (pdfFile) {
        console.log(`[${new Date().toLocaleTimeString()}] Download Complete: ${pdfFile}`);
        console.log(`[${new Date().toLocaleTimeString()}] Starting OCR-based parsing...`);
        const fullPath = path.join(DOWNLOAD_PATH, pdfFile);
        
        try {
          const affidavit = await parseForm26(fullPath);
          console.log(`[${new Date().toLocaleTimeString()}] OCR Parsing Complete. JSON generated.`);
          
          console.log(`[${new Date().toLocaleTimeString()}] Saving affidavit to database...`);
          db.run(`INSERT INTO eci_affidavits (
            candidate_id, date_of_filing, pan_number, pending_criminal_cases, 
            convictions, movable_assets_total, raw_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            candidateId, 
            affidavit.document_metadata?.date_of_filing, 
            affidavit.candidate_details?.tax_details?.pan_number,
            affidavit.legal_records?.pending_criminal_cases ? 1 : 0, 
            affidavit.legal_records?.convictions ? 1 : 0,
            affidavit.financial_declarations?.assets?.movable?.gross_total_value || 0,
            JSON.stringify(affidavit)
          ], (err) => {
            if (err) console.error(`[${new Date().toLocaleTimeString()}] Database Error: ${err.message}`);
            else console.log(`[${new Date().toLocaleTimeString()}] Affidavit saved successfully.`);
          });

          fs.unlinkSync(fullPath);
          console.log(`[${new Date().toLocaleTimeString()}] Temporary file cleaned: ${pdfFile}`);
        } catch (parseErr) {
          console.error(`[${new Date().toLocaleTimeString()}] Error during parsing: ${parseErr.message}`);
        }
      } else {
        console.error(`[${new Date().toLocaleTimeString()}] CRITICAL: Download timed out.`);
      }
    } else {
      console.log(`[${new Date().toLocaleTimeString()}] Notice: No Download button found.`);
    }
  }

  await browser.close();
  db.close();
  console.log(`\n[${new Date().toLocaleTimeString()}] --- ALL TASKS COMPLETE ---`);
}

run().catch(console.error);
